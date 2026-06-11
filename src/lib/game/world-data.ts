import type { Pothole, WorldData, Zone } from "./types";
import { END_X } from "./constants";

// All Y-like values (pipe `height`, platform `y`, player `py`) are expressed
// as "height above ground" — 0 is ground level, positive is up.

const zone1: Zone = {
  name: "I4U Labs",
  color: "#4ade80",
  start: 0,
  end: 1300,
  role: "Senior Software Engineer — Mar 2025-present",
  pipes: [
    {
      id: "i4u-stripe",
      x: 300,
      height: 55,
      label: "Stripe pipeline",
      description:
        "Rebuilt subscription billing — idempotent webhooks, coupons, trial-to-paid conversion.",
      metrics: "Stripe rebuilt",
      tags: ["Stripe", "webhooks"],
    },
    {
      id: "i4u-zoom",
      x: 580,
      height: 70,
      label: "Zoom SDK",
      description: "Video → Meeting SDK migration. 40% user retention lift.",
      metrics: "40% retention",
      tags: ["Zoom SDK"],
    },
    {
      id: "i4u-referral",
      x: 850,
      height: 50,
      label: "Referral engine",
      description:
        "Referral system with abuse prevention + promo auto-apply on Stripe renewal.",
      metrics: "1000s txns/day",
      tags: ["Supabase", "SendGrid"],
    },
    {
      id: "i4u-bot",
      x: 1100,
      height: 65,
      label: "Bot prevention",
      description:
        "Rate-limiting via Supabase to block bot abuse on Meta ad landing pages.",
      metrics: "99% blocked",
      tags: ["rate-limit"],
    },
  ],
};

const zone2: Zone = {
  name: "Vidhai Technologies",
  color: "#22d3ee",
  start: 1500,
  end: 3200,
  role: "Software Engineer — Mar 2023 - March 2025",
  pipes: [
    {
      id: "vidhai-omr",
      x: 1650,
      height: 55,
      label: "OMR pipeline",
      description: "3M+ sheets, 620K candidates, 500+ colleges. 98% accuracy.",
      metrics: "3M+ sheets, 98% accuracy",
      tags: ["Python", "OCR"],
    },
    {
      id: "vidhai-codeexec",
      x: 1950,
      height: 75,
      label: "Code exec engine",
      description:
        "Dockerized microservice — 40% latency cut, 60% throughput up.",
      metrics: "40% latency ↓",
      tags: ["Docker"],
    },
    {
      id: "vidhai-migration",
      x: 2250,
      height: 55,
      label: "GCP → AWS",
      description: "Zero-downtime migration of 6 production servers.",
      metrics: "6 servers, 0 downtime",
      tags: ["AWS", "Linux"],
    },
    {
      id: "vidhai-onprem",
      x: 2550,
      height: 70,
      label: "On-prem DC",
      description: "60+ cores, RAID NAS, failover. Infra costs cut 50%+.",
      metrics: "50%+ saved",
      tags: ["Linux", "RAID"],
    },
    {
      id: "vidhai-ai",
      x: 2900,
      height: 55,
      label: "AI pipeline",
      description: "Mistral, DeepSeek, LLaMA + Stable Diffusion in custom RAG.",
      metrics: "RAG pipeline",
      tags: ["LLaMA", "RAG"],
    },
  ],
};

const zone3: Zone = {
  name: "TinyMart",
  color: "#fbbf24",
  start: 3400,
  end: 4400,
  role: "Lightspeed-backed, $3M+ raised",
  pipes: [
    {
      id: "tinymart-wallet",
      x: 3550,
      height: 55,
      label: "Wallet system",
      description: "Auth + order processing + wallet for cashless vending.",
      metrics: "1000s daily",
      tags: ["Node.js", "PostgreSQL"],
    },
    {
      id: "tinymart-api",
      x: 3850,
      height: 65,
      label: "API optimization",
      description: "30% latency reduction across all endpoints.",
      metrics: "30% latency ↓",
      tags: ["REST", "perf"],
    },
    {
      id: "tinymart-vending",
      x: 4150,
      height: 50,
      label: "Cashless vending",
      description: "Scan, pay, dispense. UPI + wallet integration.",
      metrics: "UPI integrated",
      tags: ["payments"],
    },
  ],
};

const pothole1: Pothole = {
  x: 1300,
  width: 200,
  bridge: [
    { x: 1310, y: 50, width: 55 },
    { x: 1380, y: 90, width: 55 },
    { x: 1450, y: 50, width: 55 },
  ],
};

const pothole2: Pothole = {
  x: 3200,
  width: 200,
  bridge: [
    { x: 3210, y: 50, width: 55 },
    { x: 3280, y: 90, width: 55 },
    { x: 3350, y: 50, width: 55 },
  ],
};

export const zones: Zone[] = [zone1, zone2, zone3];
export const potholes: Pothole[] = [pothole1, pothole2];
export const allPipes = zones.flatMap((zone) => zone.pipes);

export const worldData: WorldData = {
  zones,
  potholes,
  pipes: allPipes,
  endX: END_X,
};
