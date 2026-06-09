"use client";

import type { Variants } from "framer-motion";

/**
 * Shared Framer Motion variants for scroll-triggered entrances.
 * Pair with `whileInView="show"` + `initial="hidden"` and
 * `viewport={{ once: true, margin: "-80px" }}`.
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const viewportOnce = { once: true, margin: "-80px" } as const;
