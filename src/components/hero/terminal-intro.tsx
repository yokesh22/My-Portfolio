"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useTypingEffect, type TypingLine } from "@/hooks/use-typing-effect";
import { cn } from "@/lib/utils";

const lines: TypingLine[] = [
  { text: "$ whoami", className: "text-terminal-text" },
  {
    text: "> Yokesh — Full Stack Engineer",
    className: "text-terminal-green",
    delayBefore: 250,
  },
  { text: "", className: "" },
  { text: "$ cat skills.txt", className: "text-terminal-text", delayBefore: 350 },
  {
    text: "> Node.js • Python • Docker • AWS • PostgreSQL",
    className: "text-terminal-cyan",
    delayBefore: 250,
  },
  { text: "", className: "" },
  { text: "$ cat status.txt", className: "text-terminal-text", delayBefore: 350 },
  {
    text: "> Building systems that scale.",
    className: "text-terminal-amber",
    delayBefore: 250,
  },
  { text: "> Open to opportunities.", className: "text-terminal-amber" },
];

export function TerminalIntro() {
  const [done, setDone] = useState(false);
  const { rendered, activeLine } = useTypingEffect(lines, {
    speed: 38,
    onComplete: () => setDone(true),
  });

  const scrollDown = () => {
    document
      .getElementById("skills")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="terminal-scanlines relative w-full max-w-2xl overflow-hidden rounded-lg border border-terminal-border bg-terminal-surface/80 shadow-2xl backdrop-blur-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-terminal-border px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-terminal-red" />
        <span className="h-3 w-3 rounded-full bg-terminal-amber" />
        <span className="h-3 w-3 rounded-full bg-terminal-green" />
        <span className="ml-3 font-mono text-xs text-terminal-muted">
          yokesh@portfolio: ~
        </span>
      </div>

      {/* Body */}
      <div className="min-h-[18rem] px-5 py-5 font-mono text-sm leading-relaxed sm:text-base">
        {rendered.map((line, i) => {
          if (line.text === "" && line.done) {
            return <div key={i} className="h-4" aria-hidden />;
          }
          return (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={cn("whitespace-pre-wrap", line.className)}
            >
              {line.text}
              {i === activeLine && !done && (
                <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-cursor-blink bg-terminal-green" />
              )}
            </motion.p>
          );
        })}

        {done && (
          <motion.button
            type="button"
            onClick={scrollDown}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group mt-5 inline-flex items-center gap-2 rounded border border-terminal-green/40 bg-terminal-green/10 px-4 py-2 font-mono text-sm text-terminal-green transition-all hover:bg-terminal-green/20 hover:shadow-[0_0_16px_rgba(74,222,128,0.35)]"
          >
            &gt; explore ~/portfolio
            <ArrowDown
              size={14}
              className="transition-transform group-hover:translate-y-0.5"
            />
          </motion.button>
        )}
      </div>
    </div>
  );
}
