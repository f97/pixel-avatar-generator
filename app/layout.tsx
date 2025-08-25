import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const pressStart = Press_Start_2P({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-press-start",
	weight: ["400"],
});

const vt323 = VT323({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-vt323",
	weight: ["400"],
});

export const metadata: Metadata = {
	title: "Pixel Avatar Generator - Deterministic Avatars from Email",
	description:
		"Generate unique, deterministic pixel-human avatars from email addresses. Perfect for user profiles, forums, and applications. Free API available.",
	keywords: [
		"pixel avatar",
		"avatar generator",
		"deterministic avatar",
		"email avatar",
		"pixel art",
		"user avatar",
		"API",
	],
	authors: [{ name: "Pixel Avatar Generator" }],
	creator: "xum.me",
	publisher: "xum.me",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL("https://pixel-avatar-generator.xum.me"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "Pixel Avatar Generator - Deterministic Avatars from Email",
		description:
			"Generate unique, deterministic pixel-human avatars from email addresses. Perfect for user profiles, forums, and applications.",
		url: "https://pixel-avatar-generator.xum.me",
		siteName: "Pixel Avatar Generator",
		images: [
			{
				url: "/api/avatar?email=demo@example.com&size=256&palette=nes",
				width: 256,
				height: 256,
				alt: "Pixel Avatar Generator Demo",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pixel Avatar Generator - Deterministic Avatars from Email",
		description:
			"Generate unique, deterministic pixel-human avatars from email addresses. Perfect for user profiles, forums, and applications.",
		images: ["/api/avatar?email=demo@example.com&size=256&palette=nes"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
		other: [{ url: "/favicon.svg", type: "image/svg+xml" }],
	},
	manifest: "/manifest.json",
	generator: "xum.me",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${pressStart.variable} ${vt323.variable}`}
			suppressHydrationWarning
		>
			<head>
				<style>{`
html {
  font-family: ${vt323.style.fontFamily};
  --font-sans: ${vt323.style.fontFamily};
  --font-serif: ${pressStart.style.fontFamily};
}
        `}</style>
			</head>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
