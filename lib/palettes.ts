/**
 * Color palettes for avatar generation
 */

export interface Palette {
	name: string;
	colors: string[];
	skin: string[];
	hair: string[];
	eyes: string[];
	clothes: string[];
	accent: string[];
}

export const palettes: Record<string, Palette> = {
	nes: {
		name: "NES",
		colors: [
			"#000000",
			"#FFFFFF",
			"#880000",
			"#AAFFEE",
			"#CC44CC",
			"#00CC55",
			"#0000AA",
			"#EEEE77",
			"#DD8855",
			"#664400",
			"#FF7777",
			"#333333",
			"#777777",
			"#AAFF66",
			"#0088FF",
			"#BBBBBB",
		],
		skin: ["#FFDBAC", "#F1C27D", "#E0AC69", "#C68642", "#8D5524", "#654321"],
		hair: ["#000000", "#654321", "#8D5524", "#D2691E", "#DAA520", "#FFFFFF"],
		eyes: ["#000000", "#654321", "#0000AA", "#00CC55", "#777777"],
		clothes: ["#880000", "#0000AA", "#00CC55", "#CC44CC", "#333333"],
		accent: ["#FFFFFF", "#EEEE77", "#AAFFEE", "#FF7777"],
	},

	gameboy: {
		name: "Game Boy",
		colors: ["#0F380F", "#306230", "#8BAC0F", "#9BBD0F"],
		skin: ["#9BBD0F", "#8BAC0F"],
		hair: ["#0F380F", "#306230"],
		eyes: ["#0F380F"],
		clothes: ["#306230", "#0F380F"],
		accent: ["#9BBD0F", "#8BAC0F"],
	},

	pastel: {
		name: "Pastel",
		colors: [
			"#FFB3BA",
			"#FFDFBA",
			"#FFFFBA",
			"#BAFFC9",
			"#BAE1FF",
			"#E1BAFF",
			"#FFBAE1",
			"#C9BAFF",
		],
		skin: ["#FFDFBA", "#FFB3BA", "#FFFFBA"],
		hair: ["#E1BAFF", "#C9BAFF", "#FFBAE1", "#BAE1FF"],
		eyes: ["#BAE1FF", "#BAFFC9", "#E1BAFF"],
		clothes: ["#FFB3BA", "#BAFFC9", "#C9BAFF", "#FFBAE1"],
		accent: ["#FFFFBA", "#BAFFC9", "#BAE1FF", "#FFBAE1"],
	},
};

export function getPalette(name: string): Palette {
	return palettes[name] || palettes.nes;
}
