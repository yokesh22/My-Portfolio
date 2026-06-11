"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { TerminalIntro } from "./terminal-intro";

// WebGL needs the browser — never render the canvas on the server.
const ParticleBg = dynamic(() => import("./particle-bg"), { ssr: false });

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden pt-16">
      <ParticleBg />

      {/* Gentle radial fade — keep the field visible across the hero, only
          softening it at the very edges. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_55%,var(--color-terminal-bg)_100%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 flex w-full justify-center"
      >
        <TerminalIntro />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-terminal-muted"
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
}
