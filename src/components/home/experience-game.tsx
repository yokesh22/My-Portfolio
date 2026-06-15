"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Star } from "lucide-react";
import { fadeUpVariants, viewportOnce } from "@/hooks/use-scroll-animation";
import { createInitialState, draw, update } from "@/lib/game/engine";
import { worldData, zones } from "@/lib/game/world-data";
import { END_X, TOTAL_COLLECTIBLES } from "@/lib/game/constants";
import type { GameState, Keys, Pipe } from "@/lib/game/types";
import { cn } from "@/lib/utils";

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
  const touchControlsRef = useRef<HTMLDivElement>(null);
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
  const [showRotateHint, setShowRotateHint] = useState(false);

  const lastFrameTimeRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const rotateHintTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const renderInfoPanel = useCallback((pipe: Pipe | null | undefined) => {
    const panel = infoPanelRef.current;
    if (!panel) return;
    if (!pipe) {
      if (isMobile) {
        panel.style.opacity = "";
        panel.style.transform = "translateY(100%)";
        if (touchControlsRef.current) touchControlsRef.current.style.bottom = "12px";
      } else {
        panel.style.opacity = "0";
        panel.style.transform = "translateY(8px)";
      }
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
          "rounded border-[0.5px] border-blueprint-dim bg-[rgba(59,130,246,0.06)] px-1.5 py-[2px] font-mono text-[9px] text-blueprint-accent whitespace-nowrap";
        span.textContent = tag;
        infoTagsRef.current.appendChild(span);
      }
    }
    if (isMobile) {
      panel.style.opacity = "";
      panel.style.transform = "translateY(0)";
      if (touchControlsRef.current) touchControlsRef.current.style.bottom = "152px";
    } else {
      panel.style.opacity = "1";
      panel.style.transform = "translateY(0)";
    }
  }, [isMobile]);

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
    }, isMobile ? 1500 : 2000);
  }, [isMobile]);

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

  // Suggest landscape on narrow portrait screens
  useEffect(() => {
    if (!isMobile) return;

    const checkOrientation = () => {
      const container = containerRef.current;
      const width = container?.offsetWidth ?? window.innerWidth;
      const portrait = window.innerHeight > window.innerWidth;
      if (portrait && width < 500) {
        setShowRotateHint(true);
        if (rotateHintTimeoutRef.current) clearTimeout(rotateHintTimeoutRef.current);
        rotateHintTimeoutRef.current = setTimeout(() => setShowRotateHint(false), 3000);
      } else {
        setShowRotateHint(false);
      }
    };

    const raf = requestAnimationFrame(checkOrientation);
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      if (rotateHintTimeoutRef.current) clearTimeout(rotateHintTimeoutRef.current);
    };
  }, [isMobile]);

  const dismissRotateHint = useCallback(() => {
    setShowRotateHint(false);
    if (rotateHintTimeoutRef.current) clearTimeout(rotateHintTimeoutRef.current);
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

    const loop = (timestamp: number) => {
      const frameTime = lastFrameTimeRef.current ? timestamp - lastFrameTimeRef.current : 0;
      lastFrameTimeRef.current = timestamp;

      const state = stateRef.current;
      const events = update(state, worldData, keysRef.current, canvas, isMobile, frameTime);

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

      draw(ctx, state, worldData, canvas, isMobile);

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isMobile, renderInfoPanel, showCheckpointToast, showRespawnFlash, showZoneTransition]);

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
      e.stopPropagation();
      keysRef.current[key] = true;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      keysRef.current[key] = false;
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      keysRef.current[key] = false;
    },
  });

  // Backup gesture controls: swipe to move, tap to jump
  const handleGameTouchStart = useCallback((e: React.TouchEvent) => {
    if (showRotateHint) dismissRotateHint();
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, [dismissRotateHint, showRotateHint]);

  const handleGameTouchMove = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    const t = e.touches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy)) {
      keysRef.current.right = dx > 0;
      keysRef.current.left = dx < 0;
    }
  }, []);

  const endGameTouch = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current;
    keysRef.current.left = false;
    keysRef.current.right = false;
    if (start) {
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        keysRef.current.jump = true;
        setTimeout(() => { keysRef.current.jump = false; }, 100);
      }
    }
    touchStartRef.current = null;
  }, []);

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
          onTouchStart={handleGameTouchStart}
          onTouchMove={handleGameTouchMove}
          onTouchEnd={endGameTouch}
          onTouchCancel={endGameTouch}
          className="relative h-[360px] touch-none select-none overflow-hidden rounded-xl border-[0.5px] border-[#1e293b] bg-[#0a0e17] outline-none [-webkit-touch-callout:none] focus:ring-1 focus:ring-blueprint-accent/40 sm:h-[440px]"
        >
          <canvas ref={canvasRef} className="block h-full w-full" />

          {/* Top-left: zone info */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-0.5">
            <span
              ref={zoneNameRef}
              className={cn("font-mono font-medium leading-none", isMobile ? "text-[11px]" : "text-[13px]")}
            />
            {!isMobile && (
              <span ref={zoneRoleRef} className="text-[14px] leading-none text-[#64748b] pt-1" />
            )}
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
            <span>{isMobile ? "I4U" : "I4U Labs"}</span>
            <span>{isMobile ? "VDH" : "Vidhai"}</span>
            <span>{isMobile ? "TM" : "TinyMart"}</span>
            <span>END</span>
          </div>

          {/* Info panel */}
          {isMobile ? (
            <div
              ref={infoPanelRef}
              className="pointer-events-none absolute inset-x-0 bottom-0 max-h-[140px] overflow-hidden rounded-t-xl border-t-[0.5px] border-[#1e3a5f] bg-[rgba(17,24,39,0.96)] px-4 py-3 backdrop-blur-sm transition-transform duration-300 ease-out"
              style={{ transform: "translateY(100%)" }}
            >
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <div ref={infoTitleRef} className="mb-1 truncate font-display text-[13px] font-semibold text-terminal-text" />
                  <p ref={infoDescRef} className="font-sans text-[11px] leading-snug text-terminal-muted [-webkit-line-clamp:2] [display:-webkit-box] [overflow:hidden] [-webkit-box-orient:vertical]" />
                </div>
                <div ref={infoMetricsRef} className="flex flex-shrink-0 flex-col items-end justify-start gap-0.5 text-right font-mono text-[11px] text-terminal-green" />
              </div>
              <div
                ref={infoTagsRef}
                className="mt-2 flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              />
            </div>
          ) : (
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
          )}

          {/* Zone transition text */}
          <div
            ref={transitionRef}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-[600ms]"
          >
            <div ref={transitionNameRef} className={cn("font-display font-medium", isMobile ? "text-[14px]" : "text-[18px]")} />
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
              <p className={cn("font-mono text-terminal-green", isMobile ? "text-[16px]" : "text-[20px]")}>
                $ echo &quot;journey complete&quot;
              </p>
              <p className="font-sans text-[13px] text-terminal-muted">
                You walked through Yokesh&apos;s entire career.
              </p>
              <div className={cn("mt-2 flex font-mono text-terminal-text", isMobile ? "gap-3" : "gap-5")}>
                <div className="flex flex-col items-center">
                  <span className={cn("text-terminal-amber", isMobile ? "text-[18px]" : "text-[22px]")}>{collectedCount}</span>
                  <span className="text-[10px] text-[#64748b]">achievements</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={cn("text-terminal-cyan", isMobile ? "text-[18px]" : "text-[22px]")}>3</span>
                  <span className="text-[10px] text-[#64748b]">companies</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={cn("text-terminal-green", isMobile ? "text-[18px]" : "text-[22px]")}>3+</span>
                  <span className="text-[10px] text-[#64748b]">years</span>
                </div>
              </div>
              <div className={cn("mt-4 flex", isMobile ? "w-full flex-col gap-2 px-6" : "gap-3")}>
                <button
                  type="button"
                  onClick={restart}
                  className={cn(
                    "rounded border-[0.5px] border-blueprint-dim font-mono text-[11px] text-blueprint-accent transition-colors hover:border-blueprint-line",
                    isMobile ? "w-full py-2" : "px-4 py-1.5",
                  )}
                >
                  replay
                </button>
                <button
                  type="button"
                  onClick={goToContact}
                  className={cn(
                    "rounded border-[0.5px] border-terminal-green font-mono text-[11px] text-terminal-green transition-colors hover:bg-[rgba(74,222,128,0.08)]",
                    isMobile ? "w-full py-2" : "px-4 py-1.5",
                  )}
                >
                  contact
                </button>
              </div>
            </div>
          )}

          {/* Mobile floating touch controls */}
          {isMobile && (
            <div
              ref={touchControlsRef}
              className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end justify-between transition-[bottom] duration-300 ease-out"
            >
              <div className="pointer-events-none flex gap-2">
                <button
                  type="button"
                  {...touchHandlers("left")}
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-[10px] border-[0.5px] border-[#1e293b] bg-[rgba(17,24,39,0.6)] font-mono text-[12px] text-[#4ade80] opacity-70 transition-opacity [-webkit-tap-highlight-color:transparent] active:border-[#4ade80] active:bg-[rgba(74,222,128,0.1)] active:opacity-100"
                >
                  ←
                </button>
                <button
                  type="button"
                  {...touchHandlers("right")}
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-[10px] border-[0.5px] border-[#1e293b] bg-[rgba(17,24,39,0.6)] font-mono text-[12px] text-[#4ade80] opacity-70 transition-opacity [-webkit-tap-highlight-color:transparent] active:border-[#4ade80] active:bg-[rgba(74,222,128,0.1)] active:opacity-100"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                {...touchHandlers("jump")}
                className="pointer-events-auto flex h-12 w-20 items-center justify-center rounded-[10px] border-[0.5px] border-[#1e293b] bg-[rgba(17,24,39,0.6)] font-mono text-[12px] tracking-[0.1em] text-[#4ade80] opacity-70 transition-opacity [-webkit-tap-highlight-color:transparent] active:border-[#4ade80] active:bg-[rgba(74,222,128,0.1)] active:opacity-100"
              >
                JUMP
              </button>
            </div>
          )}

          {/* Rotate suggestion overlay */}
          {isMobile && showRotateHint && (
            <div
              onClick={dismissRotateHint}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-[rgba(10,14,23,0.85)] text-center"
            >
              <Smartphone size={28} className="rotate-90 text-terminal-green" />
              <p className="font-mono text-[12px] text-terminal-text">Rotate for best experience</p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
