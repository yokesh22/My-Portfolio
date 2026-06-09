# Yokesh Portfolio — Project Context

## What this is
Personal portfolio + blog site for a backend engineer (Node.js, Python, Docker, AWS, PostgreSQL).
Built to showcase skills AND demonstrate real AWS infrastructure knowledge.
The site itself is an interview talking point.

## Tech stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + Framer Motion (animations) + React Three Fiber (hero 3D bg)
- **Fonts**: Space Grotesk (display), Inter (body), JetBrains Mono (code/terminal)
- **Database**: Self-hosted PostgreSQL via Prisma ORM
- **Blog CMS**: TipTap rich text editor behind /admin with NextAuth
- **Contact**: AWS SQS queue → consumer → DynamoDB
- **Infra**: EC2 + ALB + Auto Scaling Group + blue-green deployment + GitHub Actions CI/CD
- **Local dev**: docker-compose (PostgreSQL + LocalStack for SQS/DynamoDB)

## Design system
- Three visual modes: Terminal (dark, monospace, green accents), Blueprint (grid bg, blue lines), Content (clean readable)
- Color tokens defined in tailwind.config.ts under `terminal.*`, `blueprint.*`, `content.*`
- Dark theme throughout — no light mode

## Project structure
All source code in `src/`. Components organized by feature (`hero/`, `blog/`, `contact/`, `home/`, `layout/`, `ui/`).
API routes in `app/api/`. Prisma schema in `prisma/`. Docker config at project root.

## Conventions
- Use `cn()` from `@/lib/utils` for conditional classes
- Use Framer Motion for all animations (no raw CSS animations except cursor-blink)
- Use `next/dynamic` with `ssr: false` for Three.js/R3F components
- All components are TypeScript with explicit prop types
- No default exports except for page.tsx files
- Use `"use client"` only where needed (interactive components)
- Keep server components as default for data-fetching pages

## Current progress
Check `.claude/progress.md` for completed tasks and current phase.

## Phase plans
Detailed task specs live in `.claude/phases/`. Read the current phase file before starting work.
Each task has a checkbox — mark it `[x]` when done.

## Commands
- `npm run dev` — start dev server (port 3000)
- `docker-compose up -d` — start PostgreSQL + LocalStack
- `npx prisma migrate dev` — run migrations
- `npx prisma studio` — visual DB browser
- `npm run build` — production build (test before committing)
- `npm run lint` — ESLint check

## Important
This `.claude/` folder is committed to git. It IS the project documentation.
Always update `progress.md` after completing any task.
Always read the current phase file before starting work.
