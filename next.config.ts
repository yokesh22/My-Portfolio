import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a minimal, self-contained server build in .next/standalone
  // (only the files the app actually uses) → small Docker image.
  output: "standalone",
};

export default nextConfig;
