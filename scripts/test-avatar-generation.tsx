/**
 * Test script to verify avatar generation works correctly
 */

import { emailToSeed, XorShift32 } from "../lib/prng";
import { AvatarEngine } from "../lib/engine";
import { toSVG } from "../lib/exporters";

console.log("🧪 Testing Avatar Generation System");
console.log("=".repeat(50));

// Test 1: PRNG Determinism
console.log("\n1. Testing PRNG Determinism...");
const testEmail = "test@example.com";
const seed1 = emailToSeed(testEmail);
const seed2 = emailToSeed(testEmail);

console.log(`Email: ${testEmail}`);
console.log(`Seed 1: ${seed1}`);
console.log(`Seed 2: ${seed2}`);
console.log(`Deterministic: ${seed1 === seed2 ? "✅ PASS" : "❌ FAIL"}`);

// Test 2: PRNG Sequence
console.log("\n2. Testing PRNG Sequence...");
const prng1 = new XorShift32(seed1);
const prng2 = new XorShift32(seed1);

const sequence1 = Array.from({ length: 5 }, () => prng1.next());
const sequence2 = Array.from({ length: 5 }, () => prng2.next());

console.log(`Sequence 1: [${sequence1.join(", ")}]`);
console.log(`Sequence 2: [${sequence2.join(", ")}]`);
console.log(
	`Identical: ${JSON.stringify(sequence1) === JSON.stringify(sequence2) ? "✅ PASS" : "❌ FAIL"}`,
);

// Test 3: Avatar Generation
console.log("\n3. Testing Avatar Generation...");
try {
	const engine = new AvatarEngine(seed1, "nes");
	const buffer = engine.generate("neutral", "auto");

	console.log(`Buffer dimensions: ${buffer.width}x${buffer.height}`);
	console.log(`Avatar generation: ✅ PASS`);

	// Test symmetry
	const data = buffer.getData();
	let symmetryPass = true;

	for (let y = 0; y < buffer.height; y++) {
		for (let x = 0; x < Math.floor(buffer.width / 2); x++) {
			const leftPixel = data[y][x];
			const rightPixel = data[y][buffer.width - 1 - x];

			// Allow some asymmetry (beauty marks, single earrings, etc.)
			if (leftPixel !== rightPixel) {
				// Count asymmetric pixels - should be minimal
				const asymmetricCount = data.flat().filter((_, i) => {
					const x = i % buffer.width;
					const y = Math.floor(i / buffer.width);
					const mirrorX = buffer.width - 1 - x;
					return (
						x < Math.floor(buffer.width / 2) && data[y][x] !== data[y][mirrorX]
					);
				}).length;

				if (asymmetricCount > buffer.width * buffer.height * 0.1) {
					// Allow up to 10% asymmetry
					symmetryPass = false;
					break;
				}
			}
		}
	}

	console.log(`Symmetry check: ${symmetryPass ? "✅ PASS" : "❌ FAIL"}`);
} catch (error) {
	console.log(`Avatar generation: ❌ FAIL - ${error}`);
}

// Test 4: SVG Export
console.log("\n4. Testing SVG Export...");
try {
	const engine = new AvatarEngine(seed1, "nes");
	const buffer = engine.generate("smile", "auto");
	const svg = toSVG(buffer, 256, "transparent", "nes");

	const isValidSVG = svg.startsWith("<svg") && svg.endsWith("</svg>");
	const hasCorrectSize =
		svg.includes('width="256"') && svg.includes('height="256"');
	const hasCrispEdges = svg.includes('shape-rendering="crispEdges"');

	console.log(`Valid SVG format: ${isValidSVG ? "✅ PASS" : "❌ FAIL"}`);
	console.log(`Correct dimensions: ${hasCorrectSize ? "✅ PASS" : "❌ FAIL"}`);
	console.log(`Crisp edges: ${hasCrispEdges ? "✅ PASS" : "❌ FAIL"}`);
	console.log(`SVG length: ${svg.length} characters`);
} catch (error) {
	console.log(`SVG export: ❌ FAIL - ${error}`);
}

// Test 5: Different Moods
console.log("\n5. Testing Different Moods...");
const moods = ["neutral", "smile", "wink", "surprised", "angry"] as const;

for (const mood of moods) {
	try {
		const engine = new AvatarEngine(seed1, "nes");
		const _buffer = engine.generate(mood, "auto");
		console.log(`${mood.padEnd(10)}: ✅ PASS`);
	} catch (error) {
		console.log(`${mood.padEnd(10)}: ❌ FAIL - ${error}`);
	}
}

console.log(`\n${"=".repeat(50)}`);
console.log("🎉 Avatar Generation Test Complete!");
