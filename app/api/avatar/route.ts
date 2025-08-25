/**
 * Avatar generation API endpoint
 */

import { type NextRequest, NextResponse } from "next/server";
import { AvatarEngine } from "@/lib/engine";
import { toPNG, toSVG } from "@/lib/exporters";
import { emailToSeed } from "@/lib/prng";
import type { Gender, Mood } from "@/lib/types";
import { avatarParamsSchema, validateBackground } from "@/lib/validation";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract and validate parameters
		const rawParams = {
			email: searchParams.get("email") || "",
			size: searchParams.get("size") || "256",
			palette: searchParams.get("palette") || "nes",
			bg: searchParams.get("bg") || "transparent",
			engine: searchParams.get("engine") || "procedural",
			mood: searchParams.get("mood") || "neutral",
			gender: searchParams.get("gender") || "auto",
			seed_salt: searchParams.get("seed_salt") || "",
			format: searchParams.get("format") || "svg",
			v: searchParams.get("v") || undefined,
		};

		const validationResult = avatarParamsSchema.safeParse(rawParams);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid parameters",
					details: validationResult.error.issues.map((issue) => ({
						field: issue.path.join("."),
						message: issue.message,
					})),
				},
				{ status: 400 },
			);
		}

		const params = validationResult.data;

		if (!params.email || params.email.length === 0) {
			return NextResponse.json(
				{ error: "Email parameter is required" },
				{ status: 400 },
			);
		}

		// Validate background separately
		const validatedBg = validateBackground(params.bg);

		// Generate deterministic seed from email
		const seed = emailToSeed(params.email, params.seed_salt);

		let buffer: any;
		try {
			const engine = new AvatarEngine(seed, params.palette);
			buffer = engine.generate(params.mood as Mood, params.gender as Gender);
		} catch (error) {
			console.error("Avatar generation failed:", error);
			return NextResponse.json(
				{ error: "Avatar generation failed" },
				{ status: 500 },
			);
		}

		// Export in requested format
		let content: string | Buffer;
		let contentType: string;

		try {
			if (params.format === "png") {
				content = toPNG(buffer, params.size, validatedBg, params.palette);
				contentType = "image/png";

				if (!content || content.length === 0) {
					throw new Error("PNG generation returned empty buffer");
				}

				return new NextResponse(new Uint8Array(content), {
					headers: {
						"Content-Type": contentType,
						"Cache-Control": "public, max-age=31536000, immutable",
						"Content-Length": content.length.toString(),
						"Content-Disposition": `inline; filename="avatar-${params.email.split("@")[0]}.png"`,
					},
				});
			} else {
				content = toSVG(buffer, params.size, validatedBg, params.palette);
				contentType = "image/svg+xml";

				return new NextResponse(content, {
					headers: {
						"Content-Type": contentType,
						"Cache-Control": "public, max-age=31536000, immutable",
						"Content-Length": Buffer.byteLength(content, "utf8").toString(),
						"Content-Disposition": `inline; filename="avatar-${params.email.split("@")[0]}.svg"`,
					},
				});
			}
		} catch (error) {
			console.error("Export failed:", error);
			if (params.format === "png") {
				const fallbackPng = Buffer.from([
					0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
					0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
					0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
					0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62,
					0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00,
					0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
				]);
				return new NextResponse(fallbackPng, {
					headers: {
						"Content-Type": "image/png",
						"Cache-Control": "no-cache",
					},
				});
			}
			return NextResponse.json({ error: "Export failed" }, { status: 500 });
		}
	} catch (error) {
		console.error("Avatar generation error:", error);

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Handle other HTTP methods
export async function POST() {
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
