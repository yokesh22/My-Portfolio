import type { Metadata } from "next";
import "./globals.css";
import { inter, spaceGrotesk, jetbrainsMono } from "@/lib/fonts";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata: Metadata = {
  title: "Yokesh | Backend Engineer",
  description:
    "Backend engineer building systems that scale with Node.js, Python, Docker, AWS, and PostgreSQL. System design, distributed systems, and cloud infrastructure.",
  keywords: [
    "Backend Engineer",
    "Node.js",
    "Python",
    "AWS",
    "PostgreSQL",
    "System Design",
    "Docker",
  ],
  authors: [{ name: "Yokesh" }],
  openGraph: {
    title: "Yokesh | Backend Engineer",
    description:
      "Backend engineer building systems that scale with Node.js, AWS, and distributed system design.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-terminal-bg text-terminal-text">
        <Navbar />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </body>
    </html>
  );
}
