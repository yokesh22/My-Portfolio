"use client";

import { motion } from "framer-motion";
import { Code2, Cloud, Database, Wrench } from "lucide-react";
import {
  fadeUpVariants,
  staggerContainer,
  viewportOnce,
} from "@/hooks/use-scroll-animation";

interface SkillGroup {
  label: string;
  ref: string;
  icon: typeof Code2;
  skills: string[];
}

const groups: SkillGroup[] = [
  {
    label: "Languages",
    ref: "MOD-01",
    icon: Code2,
    skills: ["Node.js", "Python", "TypeScript"],
  },
  {
    label: "Infrastructure",
    ref: "MOD-02",
    icon: Cloud,
    skills: ["Docker", "AWS (EC2, SQS, ALB)", "GCP"],
  },
  {
    label: "Databases",
    ref: "MOD-03",
    icon: Database,
    skills: ["PostgreSQL", "MySQL", "DynamoDB", "Supabase"],
  },
  {
    label: "Tools",
    ref: "MOD-04",
    icon: Wrench,
    skills: ["Git", "GitHub Actions", "Cloudflare Workers"],
  },
];

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="blueprint-grid relative border-y border-blueprint-dim bg-blueprint-bg py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUpVariants}
          className="mb-14 flex flex-col gap-3"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-blueprint-accent">
            // schematic
          </span>
          <h2 className="font-display text-3xl font-bold text-blueprint-label sm:text-4xl">
            System architecture
          </h2>
          <p className="max-w-2xl font-sans text-sm text-blueprint-accent/70">
            The stack I build, ship, and scale with — grouped by layer.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.label}
                variants={fadeUpVariants}
                className="group relative rounded-lg border border-blueprint-line/50 bg-blueprint-bg/60 p-5 transition-all duration-300 hover:border-blueprint-line hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]"
              >
                {/* Corner reference label */}
                <span className="absolute right-3 top-3 font-mono text-[10px] tracking-widest text-blueprint-line/60">
                  {group.ref}
                </span>

                <Icon
                  size={22}
                  className="mb-4 text-blueprint-accent transition-transform duration-300 group-hover:scale-110"
                />
                <h3 className="mb-3 font-display text-lg font-semibold text-blueprint-label">
                  {group.label}
                </h3>

                <ul className="flex flex-col gap-1.5">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-center gap-2 font-mono text-sm text-blueprint-accent/80"
                    >
                      <span className="h-1 w-1 rounded-full bg-blueprint-line" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
