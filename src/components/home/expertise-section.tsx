"use client";

import { motion } from "framer-motion";
import { CreditCard, TrendingUp, Server, type LucideIcon } from "lucide-react";
import {
  fadeUpVariants,
  staggerContainer,
  viewportOnce,
} from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

type DomainCard = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  metricColor: string;
  metrics: { value: string; label: string }[];
  tags: string[];
};

type StackLayer = {
  label: string;
  color: string;
  items: string[];
};

const domainCards: DomainCard[] = [
  {
    id: "SYS-01",
    title: "Payments & growth",
    description:
      "Subscription billing, trial-to-paid funnels, referral engines with abuse guards, idempotent webhook pipelines, wallet systems.",
    icon: CreditCard,
    accentColor: "#4ade80",
    metricColor: "text-terminal-green",
    metrics: [
      { value: "Stripe", label: "pipeline rebuilt" },
      { value: "1000s", label: "daily wallet txns" },
      { value: "40%", label: "retention lift" },
    ],
    tags: ["Stripe", "webhooks", "UPI/wallet", "SendGrid", "Supabase"],
  },
  {
    id: "SYS-02",
    title: "Scale & data pipelines",
    description:
      "High-throughput processing, stateless workers, job queues, document parsing, accuracy-critical extraction at million-scale.",
    icon: TrendingUp,
    accentColor: "#22d3ee",
    metricColor: "text-terminal-cyan",
    metrics: [
      { value: "3M+", label: "sheets processed" },
      { value: "98%", label: "accuracy" },
      { value: "90%", label: "manual work cut" },
    ],
    tags: ["Python", "multiprocessing", "OMR/OCR", "job queues", "RAG"],
  },
  {
    id: "SYS-03",
    title: "Infrastructure & DevOps",
    description:
      "Cloud migrations, on-prem data centers, Docker deployments, blue-green CI/CD, load balancing, failover, cost optimization.",
    icon: Server,
    accentColor: "#fbbf24",
    metricColor: "text-terminal-amber",
    metrics: [
      { value: "6", label: "servers migrated" },
      { value: "0", label: "downtime" },
      { value: "50%+", label: "infra cost saved" },
    ],
    tags: ["Docker", "AWS", "Nginx", "Linux", "RAID NAS"],
  },
];

const stackLayers: StackLayer[] = [
  {
    label: "frontend",
    color: "#4ade80",
    items: ["Next.js", "React", "TypeScript", "Tailwind", "Flutter", "Framer Motion"],
  },
  {
    label: "backend",
    color: "#22d3ee",
    items: ["Node.js", "Python", "REST APIs", "webhooks", "Cloudflare Workers"],
  },
  {
    label: "integrations",
    color: "#a78bfa",
    items: ["Stripe", "Zoom SDK", "SendGrid", "Mailchimp", "Supabase", "UPI"],
  },
  {
    label: "data",
    color: "#fbbf24",
    items: ["PostgreSQL", "MySQL", "DynamoDB", "MongoDB", "Firestore"],
  },
  {
    label: "infra",
    color: "#94a3b8",
    items: ["Docker", "AWS EC2", "ALB", "SQS", "GCP", "GitHub Actions", "Nginx"],
  },
];

export function ExpertiseSection() {
  return (
    <motion.section
      id="skills"
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeUpVariants}
      className="blueprint-grid relative bg-blueprint-bg py-10"
    >
      {/* Edge glow lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#3b82f6,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,#3b82f6,transparent)]" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-blueprint-accent">
            {"// schematic"}
          </span>
          <h2 className="font-display text-[22px] font-bold text-terminal-text">
            What I build &amp; what I build with
          </h2>
          <p className="font-sans text-[13px] text-terminal-muted">
            Three domains I operate in — with the evidence to back each one.
          </p>
        </div>

        {/* Domain cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-3"
        >
          {domainCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={fadeUpVariants}
                className="group relative rounded-[10px] border-[0.5px] border-blueprint-dim bg-[rgba(17,24,39,0.85)] p-5 transition-all duration-300 hover:border-blueprint-line hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]"
              >
                {/* Top edge glow */}
                <div
                  className="absolute inset-x-5 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${card.accentColor}, transparent)`,
                  }}
                />

                <div className="mb-3 flex items-start justify-between">
                  <Icon size={22} style={{ color: card.accentColor }} />
                  <span className="font-mono text-xs text-[#334155]">
                    {card.id}
                  </span>
                </div>

                <h3 className="mb-2 font-display text-lg font-semibold text-blueprint-label">
                  {card.title}
                </h3>
                <p className="mb-4 font-sans text-sm text-terminal-muted">
                  {card.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-3">
                  {card.metrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col">
                      <span
                        className={cn(
                          "font-mono text-[15px] font-medium",
                          card.metricColor,
                        )}
                      >
                        {metric.value}
                      </span>
                      <span className="text-[10px] text-[#475569]">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 border-t-[0.5px] border-[#1e293b] pt-3">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border-[0.5px] border-blueprint-dim bg-[rgba(59,130,246,0.06)] px-2 py-[3px] font-mono text-[10px] text-blueprint-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Divider */}
        <div className="mb-6 mt-2 flex items-center gap-4">
          <div className="h-px flex-1 bg-blueprint-dim" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-[#334155]">
            FULL STACK // LAYERED
          </span>
          <div className="h-px flex-1 bg-blueprint-dim" />
        </div>

        {/* Stack diagram */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUpVariants}
          transition={{ delay: 0.3 }}
          className="rounded-[10px] border-[0.5px] border-blueprint-dim bg-[rgba(17,24,39,0.6)] px-6 py-5"
        >
          <div className="flex flex-col gap-3">
            {stackLayers.map((layer, i) => (
              <div key={layer.label}>
                <div className="flex items-center gap-4">
                  <span
                    className="min-w-[90px] text-right font-mono text-[11px]"
                    style={{ color: layer.color }}
                  >
                    {layer.label}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-1.5">
                    {layer.items.map((item) => (
                      <span
                        key={item}
                        className="rounded border-[0.5px] border-blueprint-dim bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-terminal-text transition-colors hover:border-blueprint-line"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {i < stackLayers.length - 1 && (
                  <div className="flex">
                    <span
                      className="min-w-[90px] text-right font-mono text-[11px] text-blueprint-dim"
                      aria-hidden
                    >
                      ↓
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
