/**
 * Type definitions for avatar generator
 */

export interface AvatarParams {
	email: string;
	size: number;
	palette: string;
	bg: string;
	engine: string;
	mood: string;
	gender: string;
	seed_salt: string;
	format: string;
	v?: string;
}

export interface AvatarFeatures {
	skinTone: number;
	jawShape: "round" | "square" | "pointed";
	eyeShape: "normal" | "smile" | "wink" | "closed" | "wide" | "surprised";
	browShape: "thin" | "thick" | "angry" | "curved";
	noseShape: "dot" | "line" | "T";
	mouthShape: "neutral" | "smile" | "teeth" | "open" | "wow" | "flat";
	hairStyle: "short" | "medium" | "long" | "bald" | "bun" | "afro" | "undercut";
	hairColor: number;
	facialHair?: "stubble" | "mustache" | "goatee";
	accessories: {
		glasses?: "round" | "square";
		earrings?: boolean;
		hat?: "cap" | "beanie";
	};
	clothesStyle: "collar" | "hoodie" | "tshirt";
	clothesColor: number;
}

export type Mood = "neutral" | "smile" | "wink" | "surprised" | "angry";
export type Gender = "auto" | "androgynous" | "masc" | "fem";
export type Format = "svg" | "png";
