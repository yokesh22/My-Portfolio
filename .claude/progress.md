# Build Progress

## Current phase: Phase 1 — Local Development
## Current task: Track A — Hero page (1C: Three.js particle background)

## Completed
- [x] Project scaffolded (Next.js 14, Tailwind, Framer Motion, R3F)
- [x] Tailwind config with color tokens (Tailwind v4 CSS-first @theme in globals.css)
- [x] Font setup (Space Grotesk, Inter, JetBrains Mono)
- [x] Root layout
- [x] Navbar component
- [x] 1B Terminal intro — use-typing-effect hook + terminal-intro.tsx (wired into hero-section, lint-clean)
- [ ] ...remaining tasks populated from phase files

## Blockers
(none currently)

## Notes
- Free tier AWS only — t2.micro, single ALB, careful with hours
- Blue-green: only spin up green during deploy, terminate old blue after flip
- LocalStack for local SQS/DynamoDB testing
