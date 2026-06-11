"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeUpVariants, viewportOnce } from "@/hooks/use-scroll-animation";
import { createInitialState, draw, update } from "@/lib/game/engine";
import { worldData, zones } from "@/lib/game/world-data";
import { END_X, TOTAL_COLLECTIBLES } from "@/lib/game/constants";
import type { GameState, Keys, Pipe } from "@/lib/game/types";

const zoneColors = new Map(zones.map((z) => [z.name, z.color]));
const zoneRoles = new Map(zones.map((z) => [z.name, z.role]));
const GAME_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "a", "d", "w", " "];

export function ExperienceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const keysRef = useRef<Keys>({ left: false, right: false, jump: false });
  const animRef = useRef<number>(0);

  // HUD refs (updated imperatively to avoid re-renders during gameplay)
  const zoneNameRef = useRef<HTMLSpanElement>(null);
  const zoneRoleRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);
  const infoTitleRef = useRef<HTMLDivElement>(null);
  const infoDescRef = useRef<HTMLParagraphElement>(null);
  const infoMetricsRef = useRef<HTMLDivElement>(null);
  const infoTagsRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const transitionNameRef = useRef<HTMLDivElement>(null);
  const transitionLineRef = useRef<HTMLDivElement>(null);
  const transitionRoleRef = useRef<HTMLDivElement>(null);
  const checkpointRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const checkpointTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [ended, setEnded] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const renderInfoPanel = useCallback((pipe: Pipe | null | undefined) => {
    const panel = infoPanelRef.current;
    if (!panel) return;
    if (!pipe) {
      panel.style.opacity = "0";
      panel.style.transform = "translateY(8px)";
      return;
    }
    if (infoTitleRef.current) infoTitleRef.current.textContent = pipe.label;
    if (infoDescRef.current) infoDescRef.current.textContent = pipe.description;
    if (infoMetricsRef.current) infoMetricsRef.current.textContent = pipe.metrics;
    if (infoTagsRef.current) {
      infoTagsRef.current.innerHTML = "";
      for (const tag of pipe.tags) {
        const span = document.createElement("span");
        span.className =
          "rounded border-[0.5px] border-blueprint-dim bg-[rgba(59,130,246,0.06)] px-1.5 py-[2px] font-mono text-[9px] text-blueprint-accent";
        span.textContent = tag;
        infoTagsRef.current.appendChild(span);
      }
    }
    panel.style.opacity = "1";
    panel.style.transform = "translateY(0)";
  }, []);

  const showZoneTransition = useCallback((zoneName: string) => {
    const el = transitionRef.current;
    if (!el) return;
    if (transitionNameRef.current) {
      transitionNameRef.current.textContent = zoneName;
      transitionNameRef.current.style.color = zoneColors.get(zoneName) ?? "#4ade80";
    }
    if (transitionLineRef.current) {
      transitionLineRef.current.style.background = zoneColors.get(zoneName) ?? "#4ade80";
    }
    if (transitionRoleRef.current) {
      transitionRoleRef.current.textContent = zoneRoles.get(zoneName) ?? "";
    }
    el.style.opacity = "1";
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      if (transitionRef.current) transitionRef.current.style.opacity = "0";
    }, 2000);
  }, []);

  const showCheckpointToast = useCallback(() => {
    const el = checkpointRef.current;
    if (!el) return;
    el.style.opacity = "1";
    if (checkpointTimeoutRef.current) clearTimeout(checkpointTimeoutRef.current);
    checkpointTimeoutRef.current = setTimeout(() => {
      if (checkpointRef.current) checkpointRef.current.style.opacity = "0";
    }, 1000);
  }, []);

  const showRespawnFlash = useCallback(() => {
    const el = flashRef.current;
    if (!el) return;
    el.style.opacity = "0.5";
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      if (flashRef.current) flashRef.current.style.opacity = "0";
    }, 400);
  }, []);

  const restart = useCallback(() => {
    stateRef.current = createInitialState();
    setEnded(false);
    if (transitionRef.current) transitionRef.current.style.opacity = "0";
    if (checkpointRef.current) checkpointRef.current.style.opacity = "0";
    if (flashRef.current) flashRef.current.style.opacity = "0";
    renderInfoPanel(null);
  }, [renderInfoPanel]);

  const goToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(touch && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const state = stateRef.current;
      const events = update(state, worldData, keysRef.current, canvas);

      if (events.zoneChanged) showZoneTransition(events.zoneChanged.name);
      if (events.checkpointHit) showCheckpointToast();
      if (events.respawned) showRespawnFlash();
      if (events.ended) {
        setCollectedCount(state.collected.size);
        setEnded(true);
      }

      // Zone HUD
      const zone = worldData.zones.find(
        (z) => state.camX + state.px >= z.start && state.camX + state.px < z.end,
      );
      const zoneName = zone?.name ?? state.lastZone;
      if (zoneNameRef.current && zoneName) {
        zoneNameRef.current.textContent = zoneName;
        zoneNameRef.current.style.color = zoneColors.get(zoneName) ?? "#4ade80";
      }
      if (zoneRoleRef.current && zoneName) {
        zoneRoleRef.current.textContent = zoneRoles.get(zoneName) ?? "";
      }

      // Counter
      if (counterRef.current) {
        counterRef.current.textContent = `${state.collected.size} / ${TOTAL_COLLECTIBLES}`;
      }

      // Progress bar
      if (progressFillRef.current) {
        const pct = Math.min(
          100,
          Math.max(0, ((state.camX + state.px) / END_X) * 100),
        );
        progressFillRef.current.style.width = `${pct}%`;
        progressFillRef.current.style.background =
          zoneColors.get(zoneName ?? "") ?? "#4ade80";
      }

      // Info panel
      renderInfoPanel(events.nearbyPipe);

      draw(ctx, state, worldData, canvas);

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [renderInfoPanel, showCheckpointToast, showRespawnFlash, showZoneTransition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (GAME_KEYS.includes(e.key)) e.preventDefault();
    if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = true;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") keysRef.current.jump = true;
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a") keysRef.current.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keysRef.current.right = false;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") keysRef.current.jump = false;
  }, []);

  const touchHandlers = (key: keyof Keys) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      keysRef.current[key] = true;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      keysRef.current[key] = false;
    },
  });

  return (
    <motion.section
      id="experience"
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeUpVariants}
      className="relative bg-terminal-bg py-10"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-blueprint-accent">
            {"// interactive"}
          </span>
          <h2 className="font-display text-[22px] font-bold text-terminal-text">
            Walk through my career
          </h2>
          <p className="font-sans text-[13px] text-terminal-muted">
            Use arrow keys to move, space to jump. Every pipe is a real project I shipped.
          </p>
        </div>

        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="relative h-[360px] overflow-hidden rounded-xl border-[0.5px] border-[#1e293b] bg-[#0a0e17] outline-none focus:ring-1 focus:ring-blueprint-accent/40 sm:h-[440px]"
        >
          <canvas ref={canvasRef} className="block h-full w-full" />

          {/* Top-left: zone info */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-0.5">
            <span ref={zoneNameRef} className="font-mono text-[13px] font-medium leading-none" />
            <span ref={zoneRoleRef} className="text-[14px] leading-none text-[#64748b] pt-1" />
          </div>

          {/* Top-right: collectible counter */}
          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 font-mono text-[11px] text-terminal-text">
            <Star size={12} className="text-terminal-amber" />
            <span ref={counterRef}>0 / {TOTAL_COLLECTIBLES}</span>
          </div>

          {/* Progress bar */}
          <div className="pointer-events-none absolute left-0 right-0 top-[52px] h-[3px] bg-[#1e293b]">
            <div
              ref={progressFillRef}
              className="h-full bg-terminal-green transition-[width] duration-150 ease-linear"
              style={{ width: "0%" }}
            />
          </div>
          <div className="pointer-events-none absolute left-0 right-0 top-[58px] flex justify-between px-2 font-mono text-[12px] text-[#475569]">
            <span>I4U Labs</span>
            <span>Vidhai</span>
            <span>TinyMart</span>
            <span>END</span>
          </div>

          {/* Info panel */}
          <div
            ref={infoPanelRef}
            className="pointer-events-none absolute right-3 top-16 w-[210px] rounded-[10px] border-[0.5px] border-blueprint-dim bg-[rgba(12,25,41,0.92)] p-3 opacity-0 transition-all duration-200"
            style={{ transform: "translateY(8px)" }}
          >
            <div ref={infoTitleRef} className="mb-1 font-display text-[13px] font-semibold text-terminal-text" />
            <p ref={infoDescRef} className="mb-2 font-sans text-[11px] leading-snug text-terminal-muted" />
            <div ref={infoMetricsRef} className="mb-2 font-mono text-[11px] text-terminal-green" />
            <div ref={infoTagsRef} className="flex flex-wrap gap-1" />
          </div>

          {/* Zone transition text */}
          <div
            ref={transitionRef}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-[600ms]"
          >
            <div ref={transitionNameRef} className="font-display text-[18px] font-medium" />
            <div ref={transitionLineRef} className="h-[2px] w-[60px] opacity-40" />
            <div ref={transitionRoleRef} className="font-mono text-[11px] text-[#64748b]" />
          </div>

          {/* Checkpoint toast */}
          <div
            ref={checkpointRef}
            className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border-[0.5px] border-terminal-green bg-[rgba(10,14,23,0.9)] px-3 py-1 font-mono text-[10px] text-terminal-green opacity-0 transition-opacity duration-150"
          >
            checkpoint saved
          </div>

          {/* Respawn flash */}
          <div
            ref={flashRef}
            className="pointer-events-none absolute inset-0 bg-terminal-red opacity-0 transition-opacity duration-150"
          />

          {/* End screen */}
          {ended && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[rgba(10,14,23,0.95)] text-center">
              <p className="font-mono text-[20px] text-terminal-green">
                $ echo &quot;journey complete&quot;
              </p>
              <p className="font-sans text-[13px] text-terminal-muted">
                You walked through Yokesh&apos;s entire career.
              </p>
              <div className="mt-2 flex gap-6 font-mono text-[12px] text-terminal-text">
                <div className="flex flex-col items-center">
                  <span className="text-terminal-amber">{collectedCount}</span>
                  <span className="text-[10px] text-[#64748b]">achievements</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-terminal-cyan">3</span>
                  <span className="text-[10px] text-[#64748b]">companies</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-terminal-green">3+</span>
                  <span className="text-[10px] text-[#64748b]">years</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={restart}
                  className="rounded border-[0.5px] border-blueprint-dim px-4 py-1.5 font-mono text-[11px] text-blueprint-accent transition-colors hover:border-blueprint-line"
                >
                  replay
                </button>
                <button
                  type="button"
                  onClick={goToContact}
                  className="rounded border-[0.5px] border-terminal-green px-4 py-1.5 font-mono text-[11px] text-terminal-green transition-colors hover:bg-[rgba(74,222,128,0.08)]"
                >
                  contact
                </button>
              </div>
            </div>
          )}

          {/* Mobile touch controls */}
          {isMobile && (
            <div className="absolute inset-x-0 bottom-0 flex h-[60px] items-stretch justify-between border-t-[0.5px] border-[#1e293b] bg-[rgba(10,14,23,0.6)]">
              <button
                type="button"
                {...touchHandlers("left")}
                className="flex flex-1 items-center justify-center font-mono text-lg text-blueprint-accent active:bg-white/5"
              >
                ←
              </button>
              <button
                type="button"
                {...touchHandlers("jump")}
                className="flex flex-[1.4] items-center justify-center border-x-[0.5px] border-[#1e293b] font-mono text-[11px] tracking-[0.1em] text-terminal-green active:bg-white/5"
              >
                JUMP
              </button>
              <button
                type="button"
                {...touchHandlers("right")}
                className="flex flex-1 items-center justify-center font-mono text-lg text-blueprint-accent active:bg-white/5"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
