# Build Progress

## Current phase: Phase 2 — AWS Infrastructure
## Current task: 2.2 + 2.3 DONE — site is LIVE via ALB. Paused; resume next session.

## AGREED NEXT-SESSION ORDER (decided 2026-06-16)
1. CONTACT FORM FLOW first (Phase 1 Track C + Phase 2.5): contact form UI → /api/contact → SQS → consumer → DynamoDB; create real SQS queue + DynamoDB table; add SQS/DynamoDB perms to portfolio-ec2-role; rebuild image → ECR → redeploy → test end-to-end. (smaller, reinforces AWS queues/NoSQL/IAM)
2. BLOG/CMS next (Phase 1 Track B + Phase 2.6): Postgres + Prisma + migrations, NextAuth /admin, TipTap editor, blog listing + detail pages. (bigger, ~2-3 sessions)
3. ASG (2.4) anytime — independent infra; can be the "make it scale/self-heal" capstone.
- Optional whenever: custom domain + HTTPS (Route 53 + ACM, attach 443 listener to ALB).
- Reminder: respect AGENTS.md — Next.js 16, read node_modules/next/dist/docs before writing app code.
- Cost: leave running + watch for $0 budget email to learn free-tier status; OR stop EC2 + delete ALB between sessions for guaranteed ~$0.

## Phase 2 progress
- [x] 2.1 Networking — VPC + 2 public subnets (ap-south-1a/b) + IGW + public route table + 3 security groups (alb/ec2/db). Built via Console. See phase-2-aws-infra.md for resource IDs.
- [x] Dockerized the app (Phase 1 4A) — next.config.ts output:'standalone'; multi-stage Dockerfile (node:22-alpine, non-root); .dockerignore. Image portfolio:local = 307MB, builds + runs at localhost:3000. VERIFIED.
- [x] 2.2 — image in ECR, EC2 (t3.micro/Ubuntu 24.04, role for ECR) running container, verified via curl localhost:3000
- [x] 2.3 — ALB (portfolio-alb) + blue/green target groups; blue healthy; SITE LIVE in browser via ALB DNS name
- [ ] 2.4 ASG → 2.5 SQS/DynamoDB → 2.6 Postgres. Optional: custom domain (Route 53 + ACM/HTTPS)

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

## Contact form flow (Phase 1 Track C — LOCAL DONE 2026-06-17)
- [x] 3A Contact form UI — already existed; wired to real API (FormData → fetch POST /api/contact, added "error" state + error banner)
- [x] 3B API route + SQS + consumer + DynamoDB — VERIFIED end-to-end locally via LocalStack
  - `docker-compose.yml` (root): localstack (sqs+dynamodb, region ap-south-1) + postgres:16 (for blog later)
  - `scripts/localstack-init.sh`: auto-creates queue `portfolio-contact-queue` + table `portfolio-contacts` on container ready
  - `.env.local` (gitignored): AWS_ENDPOINT_URL=http://localhost:4566 is the local/prod switch (unset in prod → real AWS)
  - `src/lib/aws.ts`: shared lazy-singleton SQS + DynamoDB clients (used by route + consumer)
  - `src/app/api/contact/route.ts`: validates name/email/message → SendMessage to SQS → returns {ok:true}
  - `scripts/sqs-consumer.ts`: long-polls SQS → PutItem to DynamoDB → DeleteMessage. Run: `npx tsx scripts/sqs-consumer.ts`
  - `ContactMessage` type added to src/types/index.ts
  - Verified: curl POST → consumer log shows stored+deleted → `awslocal dynamodb scan` shows the item. `npm run build` clean.
- Local dev workflow: `docker compose up -d` → `npx tsx scripts/sqs-consumer.ts` (separate terminal) → `npm run dev`. Stop infra: `docker compose down` (add `-v` to wipe data).
- [ ] Phase 2.5 — REAL AWS (next): create SQS queue + DynamoDB table in ap-south-1; add sqs:Send/Receive/Delete + dynamodb:PutItem/Scan to portfolio-ec2-role; set env on EC2 (no AWS_ENDPOINT_URL); rebuild image → ECR → redeploy; run consumer on server; test on live ALB URL.

## Blockers
(none currently)

## Notes
- Free tier AWS only — t2.micro, single ALB, careful with hours
- Blue-green: only spin up green during deploy, terminate old blue after flip
- LocalStack for local SQS/DynamoDB testing
