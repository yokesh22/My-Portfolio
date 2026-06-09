import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";

// Variable names are distinct from Tailwind v4's own --font-* theme keys.
// globals.css maps these into --font-sans / --font-display / --font-mono.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
