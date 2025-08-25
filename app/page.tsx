"use client";

import {
	Code,
	Copy,
	Download,
	ExternalLink,
	Mail,
	Palette,
	RefreshCw,
	Smile,
	User,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AvatarParams {
	email: string;
	size: number;
	palette: string;
	bg: string;
	mood: string;
	gender: string;
	seed_salt: string;
	format: string;
}

export default function AvatarGenerator() {
	const { toast } = useToast();
	const [params, setParams] = useState<AvatarParams>({
		email: "user@example.com",
		size: 256,
		palette: "nes",
		bg: "transparent",
		mood: "neutral",
		gender: "auto",
		seed_salt: "",
		format: "svg",
	});

	const [avatarUrl, setAvatarUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [variants, setVariants] = useState<string[]>([]);

	// Generate avatar URL
	const generateAvatarUrl = useCallback(
		(customParams?: Partial<AvatarParams>) => {
			const finalParams = { ...params, ...customParams };
			const searchParams = new URLSearchParams();

			Object.entries(finalParams).forEach(([key, value]) => {
				if (value) searchParams.set(key, value.toString());
			});

			return `/api/avatar?${searchParams.toString()}`;
		},
		[params],
	);

	// Update avatar when params change
	useEffect(() => {
		if (params.email) {
			setIsLoading(true);
			const url = generateAvatarUrl();
			setAvatarUrl(url);

			// Simulate loading delay for better UX
			const timer = setTimeout(() => setIsLoading(false), 300);
			return () => clearTimeout(timer);
		}
	}, [params, generateAvatarUrl]);

	// Generate variants with different seed salts
	useEffect(() => {
		if (params.email) {
			const variantUrls = Array.from({ length: 8 }, (_, i) =>
				generateAvatarUrl({ seed_salt: `variant-${i}`, size: 128 }),
			);
			setVariants(variantUrls);
		}
	}, [params.email, generateAvatarUrl]);

	const updateParam = (key: keyof AvatarParams, value: string | number) => {
		setParams((prev) => ({ ...prev, [key]: value }));
	};

	const copyUrl = async () => {
		try {
			await navigator.clipboard.writeText(window.location.origin + avatarUrl);
			toast({
				title: "URL copied!",
				description: "Avatar URL has been copied to clipboard",
			});
		} catch (_error) {
			toast({
				title: "Copy failed",
				description: "Could not copy URL to clipboard",
				variant: "destructive",
			});
		}
	};

	const downloadAvatar = () => {
		const link = document.createElement("a");
		link.href = avatarUrl;
		link.download = `avatar-${params.email.split("@")[0]}.${params.format}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast({
			title: "Download started!",
			description: `Avatar downloaded as ${params.format.toUpperCase()}`,
		});
	};

	const randomizeParams = () => {
		const moods = ["neutral", "smile", "wink", "surprised", "angry"];
		const genders = ["auto", "androgynous", "masc", "fem"];
		const palettes = ["nes", "gameboy", "pastel"];

		setParams((prev) => ({
			...prev,
			mood: moods[Math.floor(Math.random() * moods.length)],
			gender: genders[Math.floor(Math.random() * genders.length)],
			palette: palettes[Math.floor(Math.random() * palettes.length)],
			seed_salt: Math.random().toString(36).substring(7),
		}));
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header */}
				<div className="text-center mb-8 relative">
					<div className="absolute top-0 right-0">
						<ThemeToggle />
					</div>
					<h1 className="text-4xl font-serif font-bold text-foreground mb-2">
						Pixel Avatar Generator
					</h1>
					<p className="text-muted-foreground text-lg font-sans">
						Generate deterministic pixel-human avatars from email addresses
					</p>
				</div>

				<div className="md:grid md:lg:grid-cols-3 md:gap-8">
					{/* Main Preview */}
					<div className="lg:col-span-2">
						<Card className="mb-6 pixel-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 font-serif">
									<User className="h-5 w-5" />
									Live Preview
								</CardTitle>
								<CardDescription className="font-sans">
									Your avatar updates automatically as you change parameters
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col items-center space-y-4">
									<div className="relative">
										{isLoading && (
											<div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
												<RefreshCw className="h-8 w-8 animate-spin text-primary" />
											</div>
										)}
										<div className="bg-card border-2 border-border rounded-lg p-4 inline-block pixel-card">
											{avatarUrl && (
												<Image
													src={avatarUrl || "/placeholder.svg"}
													alt="Generated Avatar"
													className="block pixel-art"
													style={{
														width: `${params.size}px`,
														height: `${params.size}px`,
													}}
													width={params.size ?? 128}
													height={params.size ?? 128}
												/>
											)}
										</div>
									</div>

									<div className="flex gap-2 flex-wrap justify-center">
										<Button
											onClick={copyUrl}
											variant="outline"
											size="sm"
											className="pixel-button bg-transparent"
										>
											<Copy className="h-4 w-4 mr-2" />
											Copy URL
										</Button>
										<Button
											onClick={downloadAvatar}
											size="sm"
											className="pixel-button"
										>
											<Download className="h-4 w-4 mr-2" />
											Download {params.format.toUpperCase()}
										</Button>
										<Button
											onClick={randomizeParams}
											variant="outline"
											size="sm"
											className="pixel-button bg-transparent"
										>
											<RefreshCw className="h-4 w-4 mr-2" />
											Randomize
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Variants Grid */}
						<Card className="mb-6 pixel-card">
							<CardHeader>
								<CardTitle className="font-serif">Variants</CardTitle>
								<CardDescription className="font-sans">
									Different variations using the same email with different seed
									salts
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-4 gap-4">
									{variants.map((variantUrl, index) => (
										<div
											key={index}
											className="bg-card border border-border rounded-lg p-2 cursor-pointer hover:bg-accent/10 transition-colors pixel-card"
											onClick={() =>
												updateParam("seed_salt", `variant-${index}`)
											}
										>
											<Image
												src={variantUrl || "/placeholder.svg"}
												alt={`Variant ${index + 1}`}
												className="w-full h-auto block pixel-art"
												width={128}
												height={128}
											/>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* API Integration Guide */}
						<Card className="pixel-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 font-serif">
									<Code className="h-5 w-5" />
									API Integration Guide
								</CardTitle>
								<CardDescription className="font-sans">
									Integrate pixel avatars into your application with our simple
									REST API
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<h4 className="font-serif font-semibold mb-2">Basic Usage</h4>
									<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
										<code className="text-foreground">
											GET
											/api/avatar?email=user@example.com&size=256&palette=nes
										</code>
									</div>
								</div>

								<div>
									<h4 className="font-serif font-semibold mb-2">Parameters</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
										<div>
											<strong>email</strong> (required) - User email address
										</div>
										<div>
											<strong>size</strong> - Avatar size: 64, 128, 256, 512
										</div>
										<div>
											<strong>palette</strong> - Color scheme: nes, gameboy,
											pastel
										</div>
										<div>
											<strong>format</strong> - Output format: svg, png
										</div>
										<div>
											<strong>mood</strong> - Expression: neutral, smile, wink,
											surprised, angry
										</div>
										<div>
											<strong>gender</strong> - Bias: auto, androgynous, masc,
											fem
										</div>
										<div>
											<strong>bg</strong> - Background: transparent, #ffffff,
											#000000, pattern
										</div>
										<div>
											<strong>seed_salt</strong> - Custom variation string
										</div>
									</div>
								</div>

								<div>
									<h4 className="font-serif font-semibold mb-2">
										Example Implementations
									</h4>
									<div className="space-y-4">
										<div>
											<h5 className="font-semibold mb-2 font-sans">HTML</h5>
											<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
												<code className="text-foreground">
													{`<img src="/api/avatar?email=user@example.com&size=128" 
     alt="User Avatar" width="128" height="128" />`}
												</code>
											</div>
										</div>

										<div>
											<h5 className="font-semibold mb-2 font-sans">React</h5>
											<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
												<code className="text-foreground">
													{`const Avatar = ({ email, size = 128 }) => (
  <img 
    src={\`/api/avatar?email=\${email || "/placeholder.svg"}&size=\${size}\`}
    alt="Avatar"
    width={size}
    height={size}
  />
)`}
												</code>
											</div>
										</div>

										<div>
											<h5 className="font-semibold mb-2 font-sans">
												CSS Background
											</h5>
											<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
												<code className="text-foreground">
													{`.user-avatar {
  background-image: url('/api/avatar?email=user@example.com&size=64');
  background-size: cover;
  width: 64px;
  height: 64px;
}`}
												</code>
											</div>
										</div>
									</div>
								</div>

								<div className="flex gap-2 pt-4 border-t">
									<Button
										onClick={() =>
											window.open(
												"/api/avatar?email=demo@example.com&size=256&palette=nes",
												"_blank",
											)
										}
										variant="outline"
										size="sm"
										className="pixel-button bg-transparent"
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										Test API
									</Button>
									<Button
										onClick={() => {
											const apiUrl = `${window.location.origin}/api/avatar?email=${params.email}&size=${params.size}&palette=${params.palette}&format=${params.format}&mood=${params.mood}&gender=${params.gender}${params.seed_salt ? `&seed_salt=${params.seed_salt}` : ""}&bg=${params.bg}`;
											navigator.clipboard.writeText(apiUrl);
											toast({
												title: "API URL copied!",
												description:
													"Current configuration API URL copied to clipboard",
											});
										}}
										size="sm"
										className="pixel-button"
									>
										<Copy className="h-4 w-4 mr-2" />
										Copy Current API URL
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Controls Sidebar */}
					<div className="space-y-6">
						{/* Basic Settings */}
						<Card className="pixel-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 font-serif">
									<User className="h-5 w-5" />
									Basic Settings
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="email" className="font-sans">
										Email Address
									</Label>
									<Input
										id="email"
										type="email"
										value={params.email}
										onChange={(e) => updateParam("email", e.target.value)}
										placeholder="user@example.com"
										className="pixel-input font-sans"
									/>
								</div>

								<div>
									<Label htmlFor="size" className="font-sans">
										Size (px)
									</Label>
									<Select
										value={params.size.toString()}
										onValueChange={(value) =>
											updateParam("size", Number.parseInt(value, 10))
										}
									>
										<SelectTrigger className="pixel-input font-sans">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="pixel-card">
											<SelectItem value="64" className="font-sans">
												64px
											</SelectItem>
											<SelectItem value="128" className="font-sans">
												128px
											</SelectItem>
											<SelectItem value="256" className="font-sans">
												256px
											</SelectItem>
											<SelectItem value="512" className="font-sans">
												512px
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="format" className="font-sans">
										Format
									</Label>
									<Select
										value={params.format}
										onValueChange={(value) => updateParam("format", value)}
									>
										<SelectTrigger className="pixel-input font-sans">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="pixel-card">
											<SelectItem value="svg" className="font-sans">
												SVG
											</SelectItem>
											<SelectItem disabled value="png" className="font-sans">
												PNG
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Appearance */}
						<Card className="pixel-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 font-serif">
									<Palette className="h-5 w-5" />
									Appearance
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="palette" className="font-sans">
										Color Palette
									</Label>
									<Select
										value={params.palette}
										onValueChange={(value) => updateParam("palette", value)}
									>
										<SelectTrigger className="pixel-input font-sans">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="pixel-card">
											<SelectItem value="nes" className="font-sans">
												<div className="flex items-center gap-2">
													NES{" "}
													<Badge variant="secondary" className="pixel-button">
														16 colors
													</Badge>
												</div>
											</SelectItem>
											<SelectItem value="gameboy" className="font-sans">
												<div className="flex items-center gap-2">
													Game Boy{" "}
													<Badge variant="secondary" className="pixel-button">
														4 colors
													</Badge>
												</div>
											</SelectItem>
											<SelectItem value="pastel" className="font-sans">
												<div className="flex items-center gap-2">
													Pastel{" "}
													<Badge variant="secondary" className="pixel-button">
														8 colors
													</Badge>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="background" className="font-sans">
										Background
									</Label>
									<Select
										value={params.bg}
										onValueChange={(value) => updateParam("bg", value)}
									>
										<SelectTrigger className="pixel-input font-sans">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="pixel-card">
											<SelectItem value="transparent" className="font-sans">
												Transparent
											</SelectItem>
											<SelectItem value="#ffffff" className="font-sans">
												White
											</SelectItem>
											<SelectItem value="#000000" className="font-sans">
												Black
											</SelectItem>
											<SelectItem value="pattern" className="font-sans">
												Pattern
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Personality */}
						<Card className="pixel-card">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 font-serif">
									<Smile className="h-5 w-5" />
									Personality
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="mood" className="font-sans">
										Mood
									</Label>
									<Select
										value={params.mood}
										onValueChange={(value) => updateParam("mood", value)}
									>
										<SelectTrigger className="pixel-input font-sans">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="pixel-card">
											<SelectItem value="neutral" className="font-sans">
												Neutral
											</SelectItem>
											<SelectItem value="smile" className="font-sans">
												Smile
											</SelectItem>
											<SelectItem value="wink" className="font-sans">
												Wink
											</SelectItem>
											<SelectItem value="surprised" className="font-sans">
												Surprised
											</SelectItem>
											<SelectItem value="angry" className="font-sans">
												Angry
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="gender" className="font-sans">
										Gender Bias
									</Label>
									<Select
										value={params.gender}
										onValueChange={(value) => updateParam("gender", value)}
									>
										<SelectTrigger className="pixel-input font-sans">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="pixel-card">
											<SelectItem value="auto" className="font-sans">
												Auto
											</SelectItem>
											<SelectItem value="androgynous" className="font-sans">
												Androgynous
											</SelectItem>
											<SelectItem value="masc" className="font-sans">
												Masculine
											</SelectItem>
											<SelectItem value="fem" className="font-sans">
												Feminine
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="seed_salt" className="font-sans">
										Seed Salt (optional)
									</Label>
									<Input
										id="seed_salt"
										value={params.seed_salt}
										onChange={(e) => updateParam("seed_salt", e.target.value)}
										placeholder="Custom variation"
										className="pixel-input font-sans"
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Footer with copyright information */}
				<footer className="mt-16 pt-8 border-t border-border">
					<div className="text-center space-y-4">
						<div className="flex items-center justify-center gap-2 text-muted-foreground">
							<Mail className="h-4 w-4" />
							<span className="font-sans text-sm">
								Created with ❤️ by{" "}
								<a
									target="_blank"
									href="https://xum.me"
									className="text-primary hover:underline font-medium transition-colors"
									rel="noopener"
								>
									Xúm
								</a>
							</span>
						</div>
						<div className="text-xs text-muted-foreground font-sans">
							© {new Date().getFullYear()} Pixel Avatar Generator. All rights
							reserved.
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
