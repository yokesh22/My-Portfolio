# Build Progress

## Current phase: Phase 1 — Local Development
## Current task: Track A — 1E Experience game section

## Completed
- [x] Project scaffolded (Next.js 14, Tailwind, Framer Motion, R3F)
- [x] Tailwind config with color tokens (Tailwind v4 CSS-first @theme in globals.css)
- [x] Font setup (Space Grotesk, Inter, JetBrains Mono)
- [x] Root layout
- [x] Navbar component
- [x] 1B Terminal intro — use-typing-effect hook + terminal-intro.tsx (wired into hero-section, lint-clean)
  - Upgraded to Ubuntu-style tabs (whoami / about.md / stats); each tab remounts to re-run its own typing. After tab 1 finishes: pulsing green dot on about.md + hand-click icon nudging 3× + "more here" label that fades at 3s; all hints clear on first tab click. Unread dots per-tab until visited.
- [x] 1C Particle background — particle-bg.tsx R3F instanced mesh + proximity links + mouse repulsion (lint-clean, builds; lines brightened to cyan for visibility)
- [x] 1D Expertise + stack section (redesigned) — replaced skills-section.tsx/tech-stack.tsx with expertise-section.tsx (3 domain cards + layered stack diagram), wired in page.tsx (visual verify pending)
- [x] 1E Experience game — experience-game.tsx (Canvas2D platformer), engine in src/lib/game/ (types, constants, world-data, engine), wired into page.tsx below expertise section. Verified in browser: collision, jumping, particles, HUD, progress bar, end screen all work. Mobile touch controls test pending.
- [x] Track A (Hero / Landing) complete
- [ ] ...remaining tasks populated from phase files

## Blockers
(none currently)

## Notes
- Free tier AWS only — t2.micro, single ALB, careful with hours
- Blue-green: only spin up green during deploy, terminate old blue after flip
- LocalStack for local SQS/DynamoDB testing
