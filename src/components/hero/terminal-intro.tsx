"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Pointer } from "lucide-react";
import { useTypingEffect, type TypingLine } from "@/hooks/use-typing-effect";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  lines: TypingLine[];
}

// Updated terminal tabs — covers full-stack: payments, scaling, infra, product
// Replace your current tabs array entirely

const tabs: Tab[] = [
  {
    id: "whoami",
    label: "whoami",
    lines: [
      { text: "$ whoami", className: "text-terminal-text" },
      {
        text: "> Yokesh — Full Stack Engineer",
        className: "text-terminal-green",
        delayBefore: 250,
      },
      {
        text: "> 3+ years · payments · microservices · cloud infra",
        className: "text-terminal-green",
      },
      { text: "", className: "" },
      {
        text: "$ cat stack.json | jq '.primary'",
        className: "text-terminal-text",
        delayBefore: 350,
      },
      {
        text: "> Node.js • Python • TypeScript • Next.js • React",
        className: "text-terminal-cyan",
        delayBefore: 250,
      },
      { text: "", className: "" },
      {
        text: "$ cat stack.json | jq '.infra'",
        className: "text-terminal-text",
        delayBefore: 300,
      },
      {
        text: "> Docker • AWS (EC2 · SQS · ALB) • Nginx • Linux",
        className: "text-terminal-cyan",
        delayBefore: 250,
      },
      { text: "", className: "" },
      {
        text: "$ cat stack.json | jq '.data'",
        className: "text-terminal-text",
        delayBefore: 300,
      },
      {
        text: "> PostgreSQL • MySQL • DynamoDB • Supabase • MongoDB",
        className: "text-terminal-cyan",
        delayBefore: 250,
      },
      { text: "", className: "" },
      {
        text: "$ cat status.txt",
        className: "text-terminal-text",
        delayBefore: 350,
      },
      {
        text: "> Building systems that don't page you at 3am.",
        className: "text-terminal-amber",
        delayBefore: 250,
      },
      {
        text: "> Open to full-stack & backend roles.",
        className: "text-terminal-amber",
      },
    ],
  },
  {
    id: "about",
    label: "about.md",
    lines: [
      { text: "$ cat about.md", className: "text-terminal-text" },
      { text: "", className: "" },
      {
        text: "## payments & growth",
        className: "text-terminal-green",
        delayBefore: 250,
      },
      {
        text: "> Rebuilt Stripe subscription pipeline from scratch —",
        className: "text-terminal-text",
        delayBefore: 200,
      },
      {
        text: "> idempotent webhooks, automated coupons, trial-to-paid",
        className: "text-terminal-text",
      },
      {
        text: "> conversion, and a referral engine with abuse prevention.",
        className: "text-terminal-cyan",
      },
      { text: "", className: "" },
      {
        text: "## scale & architecture",
        className: "text-terminal-green",
        delayBefore: 300,
      },
      {
        text: "> Designed an OMR pipeline processing 3M+ sheets across",
        className: "text-terminal-text",
        delayBefore: 200,
      },
      {
        text: "> 620K candidates — 98% accuracy, 90% less manual work.",
        className: "text-terminal-cyan",
      },
      { text: "", className: "" },
      {
        text: "## infrastructure",
        className: "text-terminal-green",
        delayBefore: 300,
      },
      {
        text: "> Migrated 6 servers GCP → AWS, zero downtime.",
        className: "text-terminal-text",
        delayBefore: 200,
      },
      {
        text: "> Built on-prem data center: 60+ cores, RAID NAS,",
        className: "text-terminal-text",
      },
      {
        text: "> active-passive failover. Cut infra costs 50%+.",
        className: "text-terminal-amber",
      },
    ],
  },
  {
    id: "stats",
    label: "stats",
    lines: [
      {
        text: "$ curl https://api.yokesh.dev/impact",
        className: "text-terminal-text",
      },
      {
        text: "> HTTP/1.1 200 OK",
        className: "text-terminal-muted",
        delayBefore: 300,
      },
      { text: "", className: "" },
      {
        text: "{",
        className: "text-terminal-amber",
        delayBefore: 200,
      },
      {
        text: '  "payments": {',
        className: "text-terminal-green",
        delayBefore: 150,
      },
      {
        text: '    "stripe_pipeline":     "rebuilt from scratch",',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: '    "wallet_transactions": "1000s daily",',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: '    "webhook_handling":    "idempotent"',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: "  },",
        className: "text-terminal-green",
        delayBefore: 80,
      },
      {
        text: '  "scale": {',
        className: "text-terminal-green",
        delayBefore: 150,
      },
      {
        text: '    "sheets_processed":    "3,000,000+",',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: '    "candidates_served":   "620,000+",',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: '    "mark_accuracy":       "98%"',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: "  },",
        className: "text-terminal-green",
        delayBefore: 80,
      },
      {
        text: '  "performance": {',
        className: "text-terminal-green",
        delayBefore: 150,
      },
      {
        text: '    "manual_work_reduced": "90%",',
        className: "text-terminal-amber",
        delayBefore: 100,
      },
      {
        text: '    "api_latency_cut":     "30%",',
        className: "text-terminal-amber",
        delayBefore: 100,
      },
      {
        text: '    "exec_latency_cut":    "40%",',
        className: "text-terminal-amber",
        delayBefore: 100,
      },
      {
        text: '    "throughput_boost":     "60%",',
        className: "text-terminal-amber",
        delayBefore: 100,
      },
      {
        text: '    "user_retention_up":   "40%",',
        className: "text-terminal-amber",
        delayBefore: 100,
      },
      {
        text: '    "infra_cost_saved":    "50%+"',
        className: "text-terminal-amber",
        delayBefore: 100,
      },
      {
        text: "  },",
        className: "text-terminal-green",
        delayBefore: 80,
      },
      {
        text: '  "migrations": {',
        className: "text-terminal-green",
        delayBefore: 150,
      },
      {
        text: '    "gcp_to_aws":          "6 servers, zero downtime",',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: '    "zoom_sdk":            "Video → Meeting SDK"',
        className: "text-terminal-cyan",
        delayBefore: 100,
      },
      {
        text: "  }",
        className: "text-terminal-green",
        delayBefore: 80,
      },
      {
        text: "}",
        className: "text-terminal-amber",
        delayBefore: 100,
      },
    ],
  },
];

/** The tab the click-here hint points at once the intro finishes typing. */
const NUDGE_TAB = 1;

/**
 * Renders one tab's content, typing it out on mount. Keyed by the active tab
 * in the parent so switching tabs remounts this and restarts the animation.
 */
function TerminalPane({
  lines,
  onComplete,
}: {
  lines: TypingLine[];
  onComplete?: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const { rendered, activeLine } = useTypingEffect(lines, {
    speed: 38,
    onComplete: () => {
      setDone(true);
      onComplete?.();
    },
  });

  // The body is a fixed-height window; keep the line being typed in view as
  // content (e.g. the long stats JSON) grows past it.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rendered]);

  const scrollDown = () => {
    document
      .getElementById("skills")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={bodyRef}
      className="h-[25.8rem] overflow-y-auto px-5 py-5 font-mono text-sm leading-relaxed sm:text-base"
    >
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
  );
}

export function TerminalIntro() {
  const [activeTab, setActiveTab] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [hintsDismissed, setHintsDismissed] = useState(false);
  const [moreHereFaded, setMoreHereFaded] = useState(false);

  // Once the first tab finishes typing, fade the "more here" label out after
  // 3s. The pulsing dot and hand stay until the user clicks a tab.
  useEffect(() => {
    if (!introDone) return;
    const t = setTimeout(() => setMoreHereFaded(true), 3000);
    return () => clearTimeout(t);
  }, [introDone]);

  const selectTab = (index: number) => {
    setHintsDismissed(true);
    setVisited((prev) => new Set(prev).add(index));
    setActiveTab(index);
  };

  const hintsActive = introDone && !hintsDismissed;
  const showMoreHere = hintsActive && !moreHereFaded;

  return (
    <div className="terminal-scanlines relative w-full max-w-[46.2rem] overflow-hidden rounded-lg border border-terminal-border bg-terminal-surface/80 shadow-2xl backdrop-blur-sm">
      {/* Title bar: window controls + Ubuntu-style tabs */}
      <div className="flex items-center gap-3 border-b border-terminal-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-terminal-red" />
          <span className="h-3 w-3 rounded-full bg-terminal-amber" />
          <span className="h-3 w-3 rounded-full bg-terminal-green" />
        </div>

        <div className="ml-2 flex items-center gap-1">
          {tabs.map((tab, i) => {
            const isActive = i === activeTab;
            const unread = !visited.has(i);
            const isNudge = i === NUDGE_TAB && hintsActive;

            return (
              <Fragment key={tab.id}>
                <button
                  type="button"
                  onClick={() => selectTab(i)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-t px-3 py-1.5 font-mono text-xs transition-colors sm:text-sm",
                    isActive
                      ? "border-b-2 border-terminal-green text-terminal-green"
                      : "text-terminal-muted hover:text-terminal-text",
                  )}
                >
                  {tab.label}
                  {unread && (
                    <motion.span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-terminal-green"
                      animate={
                        isNudge
                          ? { scale: [1, 1.7, 1], opacity: [1, 0.45, 1] }
                          : { scale: 1, opacity: 1 }
                      }
                      transition={
                        isNudge
                          ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 0.2 }
                      }
                    />
                  )}
                </button>

                {/* Click-here nudge: hand taps 3 times, "more here" fades at 3s */}
                {isNudge && (
                  <div className="flex items-center gap-1.5 pl-1">
                    <motion.span
                      aria-hidden
                      className="text-terminal-green"
                      initial={{ x: 0 }}
                      animate={{ x: [0, -5, 0, -5, 0] }}
                      transition={{
                        duration: 0.55,
                        repeat: 2,
                        repeatDelay: 0.45,
                        ease: "easeInOut",
                      }}
                    >
                      <Pointer size={15} />
                    </motion.span>
                    <AnimatePresence>
                      {showMoreHere && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="whitespace-nowrap font-mono text-[11px] text-terminal-green/80"
                        >
                          more here
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Body — remounts per tab to restart its typing animation */}
      <TerminalPane
        key={activeTab}
        lines={tabs[activeTab].lines}
        onComplete={() => {
          if (activeTab === 0) setIntroDone(true);
        }}
      />
    </div>
  );
}
