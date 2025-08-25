/**
 * Unit tests for pixel buffer symmetry
 */

import { PixelBuffer } from "../buffer";

describe("PixelBuffer", () => {
	test("should create buffer with correct dimensions", () => {
		const buffer = new PixelBuffer(16, 16);
		expect(buffer.width).toBe(16);
		expect(buffer.height).toBe(16);
	});

	test("should set and get pixels correctly", () => {
		const buffer = new PixelBuffer(16, 16);

		buffer.setPixel(5, 5, 1);
		expect(buffer.getPixel(5, 5)).toBe(1);

		buffer.setPixel(10, 10, 2);
		expect(buffer.getPixel(10, 10)).toBe(2);
	});

	test("should handle out-of-bounds coordinates", () => {
		const buffer = new PixelBuffer(16, 16);

		// Should not throw
		buffer.setPixel(-1, -1, 1);
		buffer.setPixel(20, 20, 1);

		expect(buffer.getPixel(-1, -1)).toBe(-1);
		expect(buffer.getPixel(20, 20)).toBe(-1);
	});

	test("should mirror vertically correctly", () => {
		const buffer = new PixelBuffer(16, 16);

		// Set pixels on left half
		buffer.setPixel(2, 5, 1);
		buffer.setPixel(3, 8, 2);
		buffer.setPixel(7, 10, 3);

		buffer.mirrorVertically();

		// Check mirrored pixels
		expect(buffer.getPixel(13, 5)).toBe(1); // 16-1-2 = 13
		expect(buffer.getPixel(12, 8)).toBe(2); // 16-1-3 = 12
		expect(buffer.getPixel(8, 10)).toBe(3); // 16-1-7 = 8
	});

	test("should fill rectangle correctly", () => {
		const buffer = new PixelBuffer(16, 16);

		buffer.fillRect(5, 5, 3, 3, 1);

		// Check filled area
		for (let y = 5; y < 8; y++) {
			for (let x = 5; x < 8; x++) {
				expect(buffer.getPixel(x, y)).toBe(1);
			}
		}

		// Check unfilled areas
		expect(buffer.getPixel(4, 5)).toBe(-1);
		expect(buffer.getPixel(8, 5)).toBe(-1);
	});

	test("should draw line correctly", () => {
		const buffer = new PixelBuffer(16, 16);

		// Horizontal line
		buffer.drawLine(2, 5, 6, 5, 1);
		for (let x = 2; x <= 6; x++) {
			expect(buffer.getPixel(x, 5)).toBe(1);
		}

		// Vertical line
		buffer.drawLine(10, 2, 10, 6, 2);
		for (let y = 2; y <= 6; y++) {
			expect(buffer.getPixel(10, y)).toBe(2);
		}
	});

	test("should fill circle correctly", () => {
		const buffer = new PixelBuffer(16, 16);

		buffer.fillCircle(8, 8, 3, 1);

		// Check center is filled
		expect(buffer.getPixel(8, 8)).toBe(1);

		// Check points within radius
		expect(buffer.getPixel(6, 8)).toBe(1);
		expect(buffer.getPixel(10, 8)).toBe(1);
		expect(buffer.getPixel(8, 6)).toBe(1);
		expect(buffer.getPixel(8, 10)).toBe(1);
	});

	test("should clear buffer correctly", () => {
		const buffer = new PixelBuffer(16, 16);

		// Fill some pixels
		buffer.setPixel(5, 5, 1);
		buffer.setPixel(10, 10, 2);

		buffer.clear();

		// Check all pixels are cleared
		for (let y = 0; y < 16; y++) {
			for (let x = 0; x < 16; x++) {
				expect(buffer.getPixel(x, y)).toBe(-1);
			}
		}
	});
});
