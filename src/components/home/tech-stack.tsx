"use client";

import { motion } from "framer-motion";
import {
  fadeUpVariants,
  staggerContainer,
  viewportOnce,
} from "@/hooks/use-scroll-animation";

// A simple animated request-path visualization: the kind of system this
// site itself runs on (ALB -> app -> queue -> workers).
const pipeline = [
  { node: "ALB", detail: "load balancer" },
  { node: "Next.js", detail: "app servers" },
  { node: "SQS", detail: "async queue" },
  { node: "Workers", detail: "consumers" },
  { node: "PostgreSQL", detail: "datastore" },
];

export function TechStack() {
  return (
    <section className="bg-terminal-bg py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUpVariants}
          className="mb-12 flex flex-col gap-3"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-terminal-green">
            // request path
          </span>
          <h2 className="font-display text-3xl font-bold text-terminal-text sm:text-4xl">
            How it scales
          </h2>
          <p className="max-w-2xl font-sans text-sm text-terminal-muted">
            This portfolio is also a lab — deployed on EC2 behind an ALB with an
            SQS-backed contact pipeline and blue-green releases.
          </p>
        </motion.div>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="flex flex-col items-stretch gap-4 md:flex-row md:items-center"
        >
          {pipeline.map((step, i) => (
            <motion.li
              key={step.node}
              variants={fadeUpVariants}
              className="flex flex-1 items-center gap-4 md:flex-col md:gap-3"
            >
              <div className="flex w-full flex-col items-center rounded-lg border border-terminal-border bg-terminal-surface px-4 py-5 text-center transition-colors hover:border-terminal-green/50">
                <span className="font-mono text-sm font-semibold text-terminal-green">
                  {step.node}
                </span>
                <span className="mt-1 font-sans text-xs text-terminal-muted">
                  {step.detail}
                </span>
              </div>
              {i < pipeline.length - 1 && (
                <span className="font-mono text-terminal-muted md:rotate-90">
                  →
                </span>
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
