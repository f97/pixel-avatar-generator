/**
 * Procedural avatar generation engine
 */

import { XorShift32 } from "./prng";
import { PixelBuffer } from "./buffer";
import { getPalette, type Palette } from "./palettes";
import type { AvatarFeatures, Mood, Gender } from "./types";

export class AvatarEngine {
	private prng: XorShift32;
	private buffer: PixelBuffer;
	private palette: Palette;
	private features: AvatarFeatures;

	constructor(seed: number, paletteName: string) {
		this.prng = new XorShift32(seed);
		this.buffer = new PixelBuffer(16, 16);
		this.palette = getPalette(paletteName);
		this.features = this.generateFeatures();
	}

	/**
	 * Generate avatar features from PRNG
	 */
	private generateFeatures(): AvatarFeatures {
		return {
			skinTone: this.prng.int(this.palette.skin.length),
			jawShape: this.prng.pick(["round", "square", "pointed"]),
			eyeShape: this.prng.pick([
				"normal",
				"smile",
				"wink",
				"closed",
				"wide",
				"surprised",
			]),
			browShape: this.prng.pick(["thin", "thick", "angry", "curved"]),
			noseShape: this.prng.pick(["dot", "line", "T"]),
			mouthShape: this.prng.pick([
				"neutral",
				"smile",
				"teeth",
				"open",
				"wow",
				"flat",
			]),
			hairStyle: this.prng.pick([
				"short",
				"medium",
				"long",
				"bald",
				"bun",
				"afro",
				"undercut",
			]),
			hairColor: this.prng.int(this.palette.hair.length),
			facialHair: this.prng.chance(0.3)
				? this.prng.pick(["stubble", "mustache", "goatee"])
				: undefined,
			accessories: {
				glasses: this.prng.chance(0.25)
					? this.prng.pick(["round", "square"])
					: undefined,
				earrings: this.prng.chance(0.15),
				hat: this.prng.chance(0.2)
					? this.prng.pick(["cap", "beanie"])
					: undefined,
			},
			clothesStyle: this.prng.pick(["collar", "hoodie", "tshirt"]),
			clothesColor: this.prng.int(this.palette.clothes.length),
		};
	}

	/**
	 * Apply mood bias to features
	 */
	private applyMood(mood: Mood): void {
		switch (mood) {
			case "smile":
				this.features.mouthShape = "smile";
				this.features.eyeShape = this.prng.pick(["normal", "smile"]);
				break;
			case "wink":
				this.features.eyeShape = "wink";
				this.features.mouthShape = this.prng.pick(["smile", "neutral"]);
				break;
			case "surprised":
				this.features.eyeShape = "wide";
				this.features.mouthShape = "open";
				this.features.browShape = this.prng.pick(["thin", "curved"]);
				break;
			case "angry":
				this.features.browShape = "angry";
				this.features.mouthShape = this.prng.pick(["flat", "neutral"]);
				this.features.eyeShape = this.prng.pick(["normal", "closed"]);
				break;
		}
	}

	/**
	 * Apply gender bias to features
	 */
	private applyGender(gender: Gender): void {
		if (gender === "fem") {
			// Bias towards longer hair and accessories
			if (this.prng.chance(0.7)) {
				this.features.hairStyle = this.prng.pick(["medium", "long", "bun"]);
			}
			this.features.accessories.earrings = this.prng.chance(0.4);
		} else if (gender === "masc") {
			// Bias towards shorter hair and facial hair
			if (this.prng.chance(0.6)) {
				this.features.hairStyle = this.prng.pick(["short", "undercut", "bald"]);
			}
			this.features.facialHair = this.prng.chance(0.5)
				? this.prng.pick(["stubble", "mustache", "goatee"])
				: undefined;
		}
	}

	/**
	 * Draw head shape and base
	 */
	private drawHead(): void {
		const skinIndex = this.palette.colors.indexOf(
			this.palette.skin[this.features.skinTone],
		);

		switch (this.features.jawShape) {
			case "round":
				// Round head shape
				this.buffer.fillCircle(8, 7, 5, skinIndex);
				break;
			case "square":
				// Square jaw
				this.buffer.fillRect(4, 3, 8, 8, skinIndex);
				break;
			case "pointed":
				// Pointed chin
				this.buffer.fillCircle(8, 6, 5, skinIndex);
				this.buffer.fillRect(6, 10, 4, 1, skinIndex);
				break;
		}
	}

	/**
	 * Draw neck
	 */
	private drawNeck(): void {
		const skinIndex = this.palette.colors.indexOf(
			this.palette.skin[this.features.skinTone],
		);
		// Draw neck connecting head to shoulders
		this.buffer.fillRect(6, 11, 4, 2, skinIndex);
	}

	/**
	 * Draw shoulders and upper body frame
	 */
	private drawShoulders(): void {
		const skinIndex = this.palette.colors.indexOf(
			this.palette.skin[this.features.skinTone],
		);
		// Draw shoulders extending beyond clothes
		this.buffer.fillRect(2, 13, 4, 3, skinIndex); // Left shoulder
		this.buffer.fillRect(10, 13, 4, 3, skinIndex); // Right shoulder
	}

	/**
	 * Draw shirt/upper body clothing
	 */
	private drawShirt(): void {
		const clothesColorIndex = this.palette.colors.indexOf(
			this.palette.clothes[this.features.clothesColor],
		);
		const accentColor = this.palette.colors.indexOf(this.palette.accent[0]);

		switch (this.features.clothesStyle) {
			case "collar":
				// Shirt body
				this.buffer.fillRect(3, 13, 10, 3, clothesColorIndex);
				// Collar details
				this.buffer.drawLine(6, 12, 9, 12, accentColor);
				this.buffer.setPixel(7, 13, accentColor); // Button
				this.buffer.setPixel(8, 14, accentColor); // Button
				break;
			case "hoodie":
				// Hoodie body
				this.buffer.fillRect(2, 13, 12, 3, clothesColorIndex);
				// Hood strings
				this.buffer.setPixel(6, 12, accentColor);
				this.buffer.setPixel(9, 12, accentColor);
				// Kangaroo pocket outline
				this.buffer.drawLine(5, 15, 10, 15, accentColor);
				break;
			case "tshirt":
				// T-shirt body
				this.buffer.fillRect(3, 13, 10, 3, clothesColorIndex);
				// Optional graphic/logo
				if (this.prng.chance(0.3)) {
					this.buffer.setPixel(8, 14, accentColor);
					this.buffer.setPixel(7, 15, accentColor);
					this.buffer.setPixel(9, 15, accentColor);
				}
				break;
		}
	}

	/**
	 * Draw eyes
	 */
	private drawEyes(): void {
		const eyeColor = this.palette.colors.indexOf(
			this.palette.eyes[this.prng.int(this.palette.eyes.length)],
		);
		const leftEyeX = 5;
		const rightEyeX = 10;
		const eyeY = 6;

		switch (this.features.eyeShape) {
			case "normal":
				this.buffer.setPixel(leftEyeX, eyeY, eyeColor);
				this.buffer.setPixel(rightEyeX, eyeY, eyeColor);
				break;
			case "smile":
				this.buffer.setPixel(leftEyeX, eyeY + 1, eyeColor);
				this.buffer.setPixel(rightEyeX, eyeY + 1, eyeColor);
				break;
			case "wink":
				this.buffer.setPixel(leftEyeX, eyeY, eyeColor);
				this.buffer.drawLine(
					rightEyeX - 1,
					eyeY,
					rightEyeX + 1,
					eyeY,
					eyeColor,
				);
				break;
			case "closed":
				this.buffer.drawLine(leftEyeX - 1, eyeY, leftEyeX + 1, eyeY, eyeColor);
				this.buffer.drawLine(
					rightEyeX - 1,
					eyeY,
					rightEyeX + 1,
					eyeY,
					eyeColor,
				);
				break;
			case "wide":
				this.buffer.fillRect(leftEyeX - 1, eyeY, 2, 2, eyeColor);
				this.buffer.fillRect(rightEyeX - 1, eyeY, 2, 2, eyeColor);
				break;
			case "surprised":
				this.buffer.fillCircle(leftEyeX, eyeY, 1, eyeColor);
				this.buffer.fillCircle(rightEyeX, eyeY, 1, eyeColor);
				break;
		}
	}

	/**
	 * Draw eyebrows
	 */
	private drawBrows(): void {
		const browColor = 0; // Black
		const leftBrowX = 5;
		const rightBrowX = 10;
		const browY = 4;

		switch (this.features.browShape) {
			case "thin":
				this.buffer.setPixel(leftBrowX, browY, browColor);
				this.buffer.setPixel(rightBrowX, browY, browColor);
				break;
			case "thick":
				this.buffer.fillRect(leftBrowX - 1, browY, 2, 1, browColor);
				this.buffer.fillRect(rightBrowX - 1, browY, 2, 1, browColor);
				break;
			case "angry":
				this.buffer.drawLine(
					leftBrowX - 1,
					browY + 1,
					leftBrowX + 1,
					browY - 1,
					browColor,
				);
				this.buffer.drawLine(
					rightBrowX - 1,
					browY - 1,
					rightBrowX + 1,
					browY + 1,
					browColor,
				);
				break;
			case "curved":
				this.buffer.setPixel(leftBrowX - 1, browY, browColor);
				this.buffer.setPixel(leftBrowX, browY - 1, browColor);
				this.buffer.setPixel(leftBrowX + 1, browY, browColor);
				this.buffer.setPixel(rightBrowX - 1, browY, browColor);
				this.buffer.setPixel(rightBrowX, browY - 1, browColor);
				this.buffer.setPixel(rightBrowX + 1, browY, browColor);
				break;
		}
	}

	/**
	 * Draw nose
	 */
	private drawNose(): void {
		const noseColor = 0; // Black
		const noseX = 8;
		const noseY = 8;

		switch (this.features.noseShape) {
			case "dot":
				this.buffer.setPixel(noseX, noseY, noseColor);
				break;
			case "line":
				this.buffer.drawLine(noseX, noseY - 1, noseX, noseY + 1, noseColor);
				break;
			case "T":
				this.buffer.drawLine(noseX, noseY - 1, noseX, noseY + 1, noseColor);
				this.buffer.drawLine(
					noseX - 1,
					noseY + 1,
					noseX + 1,
					noseY + 1,
					noseColor,
				);
				break;
		}
	}

	/**
	 * Draw mouth
	 */
	private drawMouth(): void {
		const mouthColor = 0; // Black
		const mouthX = 8;
		const mouthY = 11;

		switch (this.features.mouthShape) {
			case "neutral":
				this.buffer.drawLine(
					mouthX - 1,
					mouthY,
					mouthX + 1,
					mouthY,
					mouthColor,
				);
				break;
			case "smile":
				this.buffer.setPixel(mouthX - 1, mouthY, mouthColor);
				this.buffer.setPixel(mouthX, mouthY - 1, mouthColor);
				this.buffer.setPixel(mouthX + 1, mouthY, mouthColor);
				break;
			case "teeth":
				this.buffer.drawLine(
					mouthX - 2,
					mouthY,
					mouthX + 2,
					mouthY,
					mouthColor,
				);
				this.buffer.setPixel(mouthX, mouthY + 1, 1); // White teeth
				break;
			case "open":
				this.buffer.fillRect(mouthX - 1, mouthY, 2, 2, mouthColor);
				break;
			case "wow":
				this.buffer.fillCircle(mouthX, mouthY, 1, mouthColor);
				break;
			case "flat":
				this.buffer.drawLine(
					mouthX - 2,
					mouthY,
					mouthX + 2,
					mouthY,
					mouthColor,
				);
				break;
		}
	}

	/**
	 * Draw hair
	 */
	private drawHair(): void {
		const hairColorIndex = this.palette.colors.indexOf(
			this.palette.hair[this.features.hairColor],
		);

		// Adjust for hat
		const hasHat = this.features.accessories.hat;
		const hairHeight = hasHat ? 2 : 3;

		switch (this.features.hairStyle) {
			case "short":
				this.buffer.fillRect(4, 1, 8, hairHeight, hairColorIndex);
				break;
			case "medium":
				this.buffer.fillRect(3, 1, 10, hairHeight + 1, hairColorIndex);
				this.buffer.fillRect(2, 4, 2, 2, hairColorIndex); // Side hair
				this.buffer.fillRect(12, 4, 2, 2, hairColorIndex);
				break;
			case "long":
				this.buffer.fillRect(3, 1, 10, hairHeight + 1, hairColorIndex);
				this.buffer.fillRect(1, 4, 3, 4, hairColorIndex); // Long side hair
				this.buffer.fillRect(12, 4, 3, 4, hairColorIndex);
				break;
			case "bald":
				// No hair
				break;
			case "bun":
				this.buffer.fillRect(4, 1, 8, 2, hairColorIndex);
				this.buffer.fillCircle(8, 0, 1, hairColorIndex); // Bun on top
				break;
			case "afro":
				this.buffer.fillCircle(8, 3, 5, hairColorIndex);
				break;
			case "undercut":
				this.buffer.fillRect(5, 1, 6, 3, hairColorIndex);
				this.buffer.fillRect(3, 4, 2, 1, hairColorIndex); // Short sides
				this.buffer.fillRect(11, 4, 2, 1, hairColorIndex);
				break;
		}
	}

	/**
	 * Draw facial hair
	 */
	private drawFacialHair(): void {
		if (!this.features.facialHair) return;

		const hairColorIndex = this.palette.colors.indexOf(
			this.palette.hair[this.features.hairColor],
		);

		switch (this.features.facialHair) {
			case "stubble":
				// Sparse pixels around jaw
				for (let i = 0; i < 8; i++) {
					if (this.prng.chance(0.3)) {
						const x = 4 + this.prng.int(8);
						const y = 12 + this.prng.int(2);
						this.buffer.setPixel(x, y, hairColorIndex);
					}
				}
				break;
			case "mustache":
				this.buffer.fillRect(6, 9, 4, 1, hairColorIndex);
				break;
			case "goatee":
				this.buffer.fillRect(7, 12, 2, 2, hairColorIndex);
				break;
		}
	}

	/**
	 * Draw accessories
	 */
	private drawAccessories(): void {
		const accessoryColor = 0; // Black

		// Glasses
		if (this.features.accessories.glasses) {
			const glassesY = 6;
			switch (this.features.accessories.glasses) {
				case "round":
					this.buffer.fillCircle(5, glassesY, 2, accessoryColor);
					this.buffer.fillCircle(10, glassesY, 2, accessoryColor);
					this.buffer.setPixel(5, glassesY, -1); // Clear center
					this.buffer.setPixel(10, glassesY, -1);
					break;
				case "square":
					this.buffer.fillRect(3, glassesY - 1, 4, 3, accessoryColor);
					this.buffer.fillRect(9, glassesY - 1, 4, 3, accessoryColor);
					this.buffer.fillRect(4, glassesY, 2, 1, -1); // Clear center
					this.buffer.fillRect(10, glassesY, 2, 1, -1);
					break;
			}
			// Bridge
			this.buffer.drawLine(7, glassesY, 8, glassesY, accessoryColor);
		}

		// Earrings
		if (this.features.accessories.earrings) {
			this.buffer.setPixel(3, 7, accessoryColor);
			this.buffer.setPixel(12, 7, accessoryColor);
		}

		// Hat
		if (this.features.accessories.hat) {
			const hatColor = this.palette.colors.indexOf(
				this.palette.clothes[this.features.clothesColor],
			);
			switch (this.features.accessories.hat) {
				case "cap":
					this.buffer.fillRect(3, 0, 10, 3, hatColor);
					this.buffer.fillRect(1, 2, 4, 1, hatColor); // Visor
					break;
				case "beanie":
					this.buffer.fillRect(4, 0, 8, 4, hatColor);
					break;
			}
		}
	}

	/**
	 * Generate complete avatar
	 */
	generate(mood: Mood = "neutral", gender: Gender = "auto"): PixelBuffer {
		// Apply mood and gender biases
		this.applyMood(mood);
		this.applyGender(gender);

		// Clear buffer
		this.buffer.clear();

		// Draw layers in order (back to front)
		this.drawShoulders();
		this.drawShirt();
		this.drawNeck();
		this.drawHead();
		this.drawHair();
		this.drawBrows();
		this.drawEyes();
		this.drawNose();
		this.drawMouth();
		this.drawFacialHair();
		this.drawAccessories();

		// Apply symmetry (mirror left half to right)
		this.buffer.mirrorVertically();

		// Add some asymmetry for realism
		this.addAsymmetry();

		return this.buffer;
	}

	/**
	 * Add subtle asymmetry for realism
	 */
	private addAsymmetry(): void {
		// Occasional single earring
		if (this.features.accessories.earrings && this.prng.chance(0.3)) {
			this.buffer.setPixel(12, 7, -1); // Remove right earring
		}

		// Occasional beauty mark
		if (this.prng.chance(0.1)) {
			const x = 4 + this.prng.int(8);
			const y = 7 + this.prng.int(4);
			this.buffer.setPixel(x, y, 0); // Black dot
		}

		// Slight hair variation
		if (this.features.hairStyle !== "bald" && this.prng.chance(0.2)) {
			const hairColorIndex = this.palette.colors.indexOf(
				this.palette.hair[this.features.hairColor],
			);
			const x = 2 + this.prng.int(2); // Left side only
			const y = 3 + this.prng.int(3);
			this.buffer.setPixel(x, y, hairColorIndex);
		}
	}
}
