/**
 * Parameter validation schemas
 */

import { z } from "zod";

export const avatarParamsSchema = z.object({
	email: z.string().email("Invalid email address"),
	size: z.coerce.number().int().min(64).max(1024).default(256),
	palette: z.enum(["nes", "gameboy", "pastel"]).default("nes"),
	bg: z.string().default("transparent"),
	engine: z.literal("procedural").default("procedural"),
	mood: z
		.enum(["neutral", "smile", "wink", "surprised", "angry"])
		.default("neutral"),
	gender: z.enum(["auto", "androgynous", "masc", "fem"]).default("auto"),
	seed_salt: z.string().default(""),
	format: z.enum(["svg", "png"]).default("svg"),
	v: z.string().optional(),
});

export type ValidatedAvatarParams = z.infer<typeof avatarParamsSchema>;

/**
 * Validate background color
 */
export function validateBackground(bg: string): string {
	if (bg === "transparent" || bg === "pattern") {
		return bg;
	}

	// Validate hex color
	const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	if (hexRegex.test(bg)) {
		return bg;
	}

	// Default to transparent for invalid colors
	return "transparent";
}

/**
 * Clamp size to valid range
 */
export function clampSize(size: number): number {
	return Math.max(64, Math.min(1024, Math.floor(size)));
}

/**
 * Validate and normalize email
 */
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}
