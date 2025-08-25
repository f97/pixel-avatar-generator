/**
 * Unit tests for PRNG determinism
 */

import { XorShift32, emailToSeed } from "../prng";

describe("XorShift32 PRNG", () => {
	test("should produce deterministic results from same seed", () => {
		const seed = 12345;
		const prng1 = new XorShift32(seed);
		const prng2 = new XorShift32(seed);

		// Generate 10 numbers from each PRNG
		const results1 = Array.from({ length: 10 }, () => prng1.next());
		const results2 = Array.from({ length: 10 }, () => prng2.next());

		expect(results1).toEqual(results2);
	});

	test("should produce different results from different seeds", () => {
		const prng1 = new XorShift32(12345);
		const prng2 = new XorShift32(54321);

		const results1 = Array.from({ length: 10 }, () => prng1.next());
		const results2 = Array.from({ length: 10 }, () => prng2.next());

		expect(results1).not.toEqual(results2);
	});

	test("should handle zero seed correctly", () => {
		const prng = new XorShift32(0);
		const result = prng.next();

		expect(result).toBeGreaterThan(0);
		expect(Number.isInteger(result)).toBe(true);
	});

	test("int() should return values in correct range", () => {
		const prng = new XorShift32(12345);

		for (let i = 0; i < 100; i++) {
			const result = prng.int(10);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThan(10);
			expect(Number.isInteger(result)).toBe(true);
		}
	});

	test("pick() should return array elements", () => {
		const prng = new XorShift32(12345);
		const array = ["a", "b", "c", "d", "e"];

		for (let i = 0; i < 50; i++) {
			const result = prng.pick(array);
			expect(array).toContain(result);
		}
	});

	test("chance() should respect probability", () => {
		const prng = new XorShift32(12345);
		const trials = 1000;

		// Test 0% chance
		let trueCount = 0;
		for (let i = 0; i < trials; i++) {
			if (prng.chance(0)) trueCount++;
		}
		expect(trueCount).toBe(0);

		// Test 100% chance
		trueCount = 0;
		for (let i = 0; i < trials; i++) {
			if (prng.chance(1)) trueCount++;
		}
		expect(trueCount).toBe(trials);
	});
});

describe("emailToSeed", () => {
	test("should produce same seed for same email", () => {
		const email = "test@example.com";
		const seed1 = emailToSeed(email);
		const seed2 = emailToSeed(email);

		expect(seed1).toBe(seed2);
	});

	test("should produce different seeds for different emails", () => {
		const seed1 = emailToSeed("test1@example.com");
		const seed2 = emailToSeed("test2@example.com");

		expect(seed1).not.toBe(seed2);
	});

	test("should normalize email case", () => {
		const seed1 = emailToSeed("Test@Example.Com");
		const seed2 = emailToSeed("test@example.com");

		expect(seed1).toBe(seed2);
	});

	test("should handle salt parameter", () => {
		const email = "test@example.com";
		const seed1 = emailToSeed(email, "");
		const seed2 = emailToSeed(email, "salt");

		expect(seed1).not.toBe(seed2);
	});

	test("should trim whitespace", () => {
		const seed1 = emailToSeed("  test@example.com  ");
		const seed2 = emailToSeed("test@example.com");

		expect(seed1).toBe(seed2);
	});
});
