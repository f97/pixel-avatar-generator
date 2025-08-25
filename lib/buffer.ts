/**
 * 2D pixel buffer for avatar generation
 */

export type ColorIndex = number | -1; // -1 for transparent

export class PixelBuffer {
	private buffer: ColorIndex[][];
	public readonly width: number;
	public readonly height: number;

	constructor(width = 16, height = 16) {
		this.width = width;
		this.height = height;
		this.buffer = Array(height)
			.fill(null)
			.map(() => Array(width).fill(-1));
	}

	/**
	 * Set pixel color at coordinates
	 */
	setPixel(x: number, y: number, colorIndex: ColorIndex): void {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			this.buffer[y][x] = colorIndex;
		}
	}

	/**
	 * Get pixel color at coordinates
	 */
	getPixel(x: number, y: number): ColorIndex {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			return this.buffer[y][x];
		}
		return -1;
	}

	/**
	 * Fill rectangle with color
	 */
	fillRect(
		x: number,
		y: number,
		width: number,
		height: number,
		colorIndex: ColorIndex,
	): void {
		for (let dy = 0; dy < height; dy++) {
			for (let dx = 0; dx < width; dx++) {
				this.setPixel(x + dx, y + dy, colorIndex);
			}
		}
	}

	/**
	 * Draw line between two points
	 */
	drawLine(
		x0: number,
		y0: number,
		x1: number,
		y1: number,
		colorIndex: ColorIndex,
	): void {
		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx - dy;

		let x = x0;
		let y = y0;

		while (true) {
			this.setPixel(x, y, colorIndex);

			if (x === x1 && y === y1) break;

			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x += sx;
			}
			if (e2 < dx) {
				err += dx;
				y += sy;
			}
		}
	}

	/**
	 * Draw filled circle
	 */
	fillCircle(
		centerX: number,
		centerY: number,
		radius: number,
		colorIndex: ColorIndex,
	): void {
		for (let y = -radius; y <= radius; y++) {
			for (let x = -radius; x <= radius; x++) {
				if (x * x + y * y <= radius * radius) {
					this.setPixel(centerX + x, centerY + y, colorIndex);
				}
			}
		}
	}

	/**
	 * Mirror left half to right half (for facial symmetry)
	 */
	mirrorVertically(): void {
		const midX = Math.floor(this.width / 2);
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < midX; x++) {
				const mirrorX = this.width - 1 - x;
				this.buffer[y][mirrorX] = this.buffer[y][x];
			}
		}
	}

	/**
	 * Get raw buffer data
	 */
	getData(): ColorIndex[][] {
		return this.buffer.map((row) => [...row]);
	}

	/**
	 * Clear buffer
	 */
	clear(): void {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.buffer[y][x] = -1;
			}
		}
	}
}
