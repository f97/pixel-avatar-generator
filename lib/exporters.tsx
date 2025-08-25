/**
 * Avatar export utilities for SVG and PNG formats
 */

import type { PixelBuffer } from "./buffer";
import { getPalette } from "./palettes";

/**
 * Export avatar as SVG string
 */
export function toSVG(
	buffer: PixelBuffer,
	size: number,
	bg: string,
	paletteName: string,
): string {
	const palette = getPalette(paletteName);
	const pixelSize = size / buffer.width;
	const data = buffer.getData();

	let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">`;

	// Background
	if (bg !== "transparent") {
		if (bg === "pattern") {
			// Simple checkerboard pattern
			svg += `<defs><pattern id="bg" patternUnits="userSpaceOnUse" width="${pixelSize * 2}" height="${pixelSize * 2}">
        <rect width="${pixelSize}" height="${pixelSize}" fill="#f0f0f0"/>
        <rect x="${pixelSize}" y="${pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="#f0f0f0"/>
        <rect x="${pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="#e0e0e0"/>
        <rect y="${pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="#e0e0e0"/>
      </pattern></defs>`;
			svg += `<rect width="${size}" height="${size}" fill="url(#bg)"/>`;
		} else {
			svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
		}
	}

	// Group adjacent pixels of same color for optimization
	const rects: {
		x: number;
		y: number;
		width: number;
		height: number;
		color: string;
	}[] = [];
	const processed = Array(buffer.height)
		.fill(null)
		.map(() => Array(buffer.width).fill(false));

	for (let y = 0; y < buffer.height; y++) {
		for (let x = 0; x < buffer.width; x++) {
			if (processed[y][x] || data[y][x] === -1) continue;

			const colorIndex = data[y][x];
			const color = palette.colors[colorIndex];

			// Find width of horizontal run
			let width = 1;
			while (
				x + width < buffer.width &&
				data[y][x + width] === colorIndex &&
				!processed[y][x + width]
			) {
				width++;
			}

			// Find height of vertical run
			let height = 1;
			let canExtendVertically = true;
			while (y + height < buffer.height && canExtendVertically) {
				for (let dx = 0; dx < width; dx++) {
					if (
						data[y + height][x + dx] !== colorIndex ||
						processed[y + height][x + dx]
					) {
						canExtendVertically = false;
						break;
					}
				}
				if (canExtendVertically) height++;
			}

			// Mark pixels as processed
			for (let dy = 0; dy < height; dy++) {
				for (let dx = 0; dx < width; dx++) {
					processed[y + dy][x + dx] = true;
				}
			}

			rects.push({
				x: x * pixelSize,
				y: y * pixelSize,
				width: width * pixelSize,
				height: height * pixelSize,
				color,
			});
		}
	}

	// Add rectangles to SVG
	for (const rect of rects) {
		svg += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${rect.color}"/>`;
	}

	svg += "</svg>";
	return svg;
}

/**
 * Export avatar as PNG buffer using Canvas API (server-side compatible)
 */
export function toPNG(
	buffer: PixelBuffer,
	size: number,
	bg: string,
	paletteName: string,
): Buffer {
	try {
		const palette = getPalette(paletteName);
		const data = buffer.getData();

		if (!data || !palette || !palette.colors) {
			throw new Error("Invalid buffer data or palette");
		}

		const pixelSize = Math.max(1, Math.floor(size / buffer.width));
		const actualSize = pixelSize * buffer.width;

		// Create RGBA bitmap data
		const bitmapData = new Uint8Array(actualSize * actualSize * 4);

		// Fill background first
		let bgColor: [number, number, number, number] = [0, 0, 0, 0]; // transparent default

		if (bg !== "transparent") {
			if (bg === "pattern") {
				// Create a simple checkerboard pattern
				for (let y = 0; y < actualSize; y++) {
					for (let x = 0; x < actualSize; x++) {
						const index = (y * actualSize + x) * 4;
						const checker =
							Math.floor(x / pixelSize) + Math.floor(y / pixelSize);
						const isLight = checker % 2 === 0;
						const gray = isLight ? 240 : 220;
						bitmapData[index] = gray; // R
						bitmapData[index + 1] = gray; // G
						bitmapData[index + 2] = gray; // B
						bitmapData[index + 3] = 255; // A
					}
				}
			} else {
				bgColor = hexToRgba(bg);
				// Fill entire bitmap with background color
				for (let i = 0; i < bitmapData.length; i += 4) {
					bitmapData[i] = bgColor[0]; // R
					bitmapData[i + 1] = bgColor[1]; // G
					bitmapData[i + 2] = bgColor[2]; // B
					bitmapData[i + 3] = bgColor[3]; // A
				}
			}
		}

		// Draw avatar pixels
		for (let y = 0; y < buffer.height; y++) {
			for (let x = 0; x < buffer.width; x++) {
				const colorIndex = data[y][x];
				if (colorIndex === -1 || colorIndex >= palette.colors.length) continue; // Skip transparent or invalid pixels

				const hexColor = palette.colors[colorIndex];
				if (!hexColor) continue; // Skip if color doesn't exist

				const color = hexToRgba(hexColor);

				// Scale pixel to final size using nearest-neighbor
				for (let dy = 0; dy < pixelSize; dy++) {
					for (let dx = 0; dx < pixelSize; dx++) {
						const finalX = x * pixelSize + dx;
						const finalY = y * pixelSize + dy;

						if (
							finalX >= 0 &&
							finalX < actualSize &&
							finalY >= 0 &&
							finalY < actualSize
						) {
							const index = (finalY * actualSize + finalX) * 4;
							bitmapData[index] = color[0]; // R
							bitmapData[index + 1] = color[1]; // G
							bitmapData[index + 2] = color[2]; // B
							bitmapData[index + 3] = color[3]; // A
						}
					}
				}
			}
		}

		return generatePNG(bitmapData, actualSize, actualSize);
	} catch (error) {
		console.error("PNG generation failed:", error);
		// Fallback: return a simple 1x1 transparent PNG
		const fallbackData = new Uint8Array(4); // 1x1 RGBA
		fallbackData[0] = 0; // R
		fallbackData[1] = 0; // G
		fallbackData[2] = 0; // B
		fallbackData[3] = 0; // A (transparent)
		return generatePNG(fallbackData, 1, 1);
	}
}

/**
 * Convert hex color to RGBA array with better error handling
 */
function hexToRgba(hex: string): [number, number, number, number] {
	if (!hex || typeof hex !== "string") {
		return [0, 0, 0, 255]; // Default to black if invalid
	}

	let cleanHex = hex.trim();
	if (cleanHex.startsWith("#")) {
		cleanHex = cleanHex.slice(1);
	}

	// Handle 3-digit hex
	if (cleanHex.length === 3) {
		cleanHex = cleanHex
			.split("")
			.map((c) => c + c)
			.join("");
	}

	// Ensure we have 6 characters
	if (cleanHex.length !== 6) {
		return [0, 0, 0, 255]; // Default to black if invalid length
	}

	const r = Number.parseInt(cleanHex.slice(0, 2), 16);
	const g = Number.parseInt(cleanHex.slice(2, 4), 16);
	const b = Number.parseInt(cleanHex.slice(4, 6), 16);

	// Check for NaN values
	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
		return [0, 0, 0, 255]; // Default to black if parsing failed
	}

	return [r, g, b, 255];
}

/**
 * Generate PNG buffer from RGBA bitmap data
 * Simple PNG implementation for server-side generation
 */
function generatePNG(data: Uint8Array, width: number, height: number): Buffer {
	try {
		// PNG signature
		const signature = Buffer.from([
			0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
		]);

		// IHDR chunk
		const ihdr = Buffer.alloc(25);
		ihdr.writeUInt32BE(13, 0); // Length
		ihdr.write("IHDR", 4);
		ihdr.writeUInt32BE(width, 8);
		ihdr.writeUInt32BE(height, 12);
		ihdr.writeUInt8(8, 16); // Bit depth
		ihdr.writeUInt8(6, 17); // Color type (RGBA)
		ihdr.writeUInt8(0, 18); // Compression
		ihdr.writeUInt8(0, 19); // Filter
		ihdr.writeUInt8(0, 20); // Interlace

		// Calculate CRC for IHDR
		const ihdrCrc = crc32(ihdr.subarray(4, 21));
		ihdr.writeUInt32BE(ihdrCrc, 21);

		// Prepare image data with filter bytes
		const imageData = Buffer.alloc((width * 4 + 1) * height);
		let pos = 0;

		for (let y = 0; y < height; y++) {
			imageData[pos++] = 0; // Filter type: None
			for (let x = 0; x < width; x++) {
				const srcIndex = (y * width + x) * 4;
				imageData[pos++] = data[srcIndex] || 0; // R
				imageData[pos++] = data[srcIndex + 1] || 0; // G
				imageData[pos++] = data[srcIndex + 2] || 0; // B
				imageData[pos++] = data[srcIndex + 3] || 0; // A
			}
		}

		// Compress image data (simple deflate)
		const compressed = deflate(imageData);

		// IDAT chunk
		const idat = Buffer.alloc(compressed.length + 12);
		idat.writeUInt32BE(compressed.length, 0);
		idat.write("IDAT", 4);
		compressed.copy(idat, 8);
		const idatCrc = crc32(idat.subarray(4, idat.length - 4));
		idat.writeUInt32BE(idatCrc, idat.length - 4);

		// IEND chunk
		const iend = Buffer.from([
			0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
		]);

		return Buffer.concat([signature, ihdr, idat, iend]);
	} catch (error) {
		console.error("PNG buffer generation failed:", error);
		// Return minimal valid PNG
		return Buffer.from([
			0x89,
			0x50,
			0x4e,
			0x47,
			0x0d,
			0x0a,
			0x1a,
			0x0a, // PNG signature
			0x00,
			0x00,
			0x00,
			0x0d, // IHDR length
			0x49,
			0x48,
			0x44,
			0x52, // IHDR
			0x00,
			0x00,
			0x00,
			0x01, // width: 1
			0x00,
			0x00,
			0x00,
			0x01, // height: 1
			0x08,
			0x06,
			0x00,
			0x00,
			0x00, // bit depth, color type, compression, filter, interlace
			0x1f,
			0x15,
			0xc4,
			0x89, // CRC
			0x00,
			0x00,
			0x00,
			0x0a, // IDAT length
			0x49,
			0x44,
			0x41,
			0x54, // IDAT
			0x78,
			0x9c,
			0x62,
			0x00,
			0x00,
			0x00,
			0x02,
			0x00,
			0x01, // compressed data
			0xe2,
			0x21,
			0xbc,
			0x33, // CRC
			0x00,
			0x00,
			0x00,
			0x00, // IEND length
			0x49,
			0x45,
			0x4e,
			0x44, // IEND
			0xae,
			0x42,
			0x60,
			0x82, // CRC
		]);
	}
}

/**
 * Simple CRC32 implementation
 */
function crc32(data: Buffer): number {
	const crcTable = new Uint32Array(256);

	// Generate CRC table
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let j = 0; j < 8; j++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		crcTable[i] = c;
	}

	let crc = 0xffffffff;
	for (let i = 0; i < data.length; i++) {
		crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
	}

	return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Simple deflate compression (uncompressed blocks)
 */
function deflate(data: Buffer): Buffer {
	// Create uncompressed deflate blocks
	const maxBlockSize = 65535;
	const blocks: Buffer[] = [];

	for (let i = 0; i < data.length; i += maxBlockSize) {
		const blockSize = Math.min(maxBlockSize, data.length - i);
		const isLast = i + blockSize >= data.length;

		const block = Buffer.alloc(blockSize + 5);
		block[0] = isLast ? 1 : 0; // BFINAL and BTYPE
		block.writeUInt16LE(blockSize, 1); // LEN
		block.writeUInt16LE(~blockSize & 0xffff, 3); // NLEN
		data.copy(block, 5, i, i + blockSize);

		blocks.push(block);
	}

	return Buffer.concat(blocks);
}

/**
 * Generate download filename for avatar
 */
export function generateFilename(
	email: string,
	format: string,
	_params: any,
): string {
	const emailHash = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
	const timestamp = Date.now().toString(36);
	return `avatar-${emailHash}-${timestamp}.${format}`;
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: string): string {
	switch (format) {
		case "png":
			return "image/png";
		default:
			return "image/svg+xml";
	}
}
