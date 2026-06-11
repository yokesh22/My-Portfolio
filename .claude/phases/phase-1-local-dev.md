# Phase 1 — Local Development

## Track A: Hero / Landing Page

### 1A. Project scaffold ✅
- [x] Next.js 14 + TypeScript + Tailwind + App Router
- [x] Install framer-motion, @react-three/fiber, @react-three/drei, three
- [x] Install prisma, next-auth, tiptap, aws-sdk
- [x] Tailwind config with terminal/blueprint/content color tokens
- [x] Font loading (Space Grotesk, Inter, JetBrains Mono)
- [x] globals.css with blueprint-grid, terminal-scanlines, scrollbar styles
- [x] Root layout with fonts + metadata
- [x] Navbar with terminal-style links

### 1B. Terminal intro animation
- [x] Create `use-typing-effect.ts` hook
  - Accepts array of lines with per-line delay
  - Returns current visible text + cursor position
  - Supports pause between lines
- [x] Build `terminal-intro.tsx` component
  - Terminal window chrome (dots, title bar)
  - Ubuntu-style tabs: whoami / about.md / stats — each tab has its own content
    and remounts (keyed on active tab) to re-run its typing animation on switch
  - Typing sequence per tab (whoami → skills → status on tab 1)
  - Blinking cursor (CSS animation)
  - After tab 1 typing completes: pulsing green dot on about.md tab + hand-click
    (Pointer) icon nudging 3×, plus "more here" label that fades after 3s
  - All hints clear on first tab click; per-tab unread dots persist until visited
  - After typing completes: fade-in CTA button "explore ~/portfolio"
  - Use Framer Motion for line reveals
- [ ] Test: smooth typing, no layout shifts, works on mobile (visual verify pending)

### 1C. Three.js particle background
- [x] Build `particle-bg.tsx` with React Three Fiber
  - Canvas with transparent background, ssr: false via next/dynamic (in hero-section)
  - 120 particles (instanced mesh for performance)
  - Particles connected by lines when within threshold distance
  - Slow random drift animation
  - Mouse interaction: gentle repulsion near cursor
  - Color: terminal-green with low opacity
  - Cap at 30fps (delta accumulator), use `useFrame` for animation loop
  - Mutable sim state in refs + Math.random in effect (React Compiler purity/immutability)
- [ ] Performance: test on throttled CPU, keep under 16ms frame time (visual verify pending)

### 1D. Expertise + stack section (redesigned)
- [x] Replaced old skills grid with combined expertise section
- [x] 3 domain cards: Payments, Scale, Infrastructure — with metrics
- [x] Layered stack diagram: frontend → backend → integrations → data → infra
- [x] Blueprint grid background with edge glow lines
- [x] Framer Motion scroll-triggered staggered animations
- [x] Mobile responsive (cards stack, items wrap)
- [ ] Visual verify: check section looks correct in browser

### 1E. Experience game section
- [x] Build experience-game.tsx with Canvas 2D game engine
- [x] Three zones: I4U Labs (green), Vidhai (cyan), TinyMart (amber)
- [x] 12 pipe landmarks with achievement data, collectible stars
- [x] Solid pipe collision: player blocked horizontally, can land on top
- [x] Pothole gaps between zones with bridge platforms
- [x] Checkpoint system: respawn at last collected pipe
- [x] Red flash respawn effect
- [x] Zone transition cinematic text (fade in/out)
- [x] Particle trail behind player when moving
- [x] Progress bar + HUD (zone name, collected counter)
- [x] Info panel showing achievement details near pipes
- [x] End screen with stats and replay/contact buttons
- [x] Mobile touch controls (button overlay for left/right/jump)
- [x] Section heading with "Walk through my career" + instructions
- [x] Added to page.tsx below expertise section
- [x] Visual verify: play through entire game, test all mechanics
- [ ] Test on mobile: touch controls work, game is playable at 360px height

---

## Track B: Blog / Journal with CMS

### 2A. PostgreSQL + Prisma
- [ ] docker-compose up (PostgreSQL + LocalStack)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Verify tables created: User, Post, Tag
- [ ] Create `lib/db.ts` — Prisma client singleton
- [ ] Seed script: create admin user + 2 sample posts with tags
  - `npx prisma db seed` via package.json seed config

### 2B. Admin panel + auth
- [ ] Configure NextAuth with credentials provider
  - Hash passwords with bcrypt
  - Session strategy: JWT
  - Protected routes: /admin/*
- [ ] Build admin layout with sidebar navigation
- [ ] Build TipTap editor page (`/admin/editor`)
  - Rich text editor with toolbar
  - Extensions: heading, bold, italic, code-block with syntax highlighting, link, image
  - Title field + slug auto-generation
  - Tag selector (multi-select, create new)
  - Publish/Draft toggle
  - Save → POST /api/posts
- [ ] Build admin dashboard (`/admin`)
  - List all posts (published + drafts)
  - Edit / delete actions
  - Quick stats: total posts, total tags

### 2C. Blog listing + post detail pages
- [ ] Blog listing page (`/blog`)
  - Fetch published posts, server component
  - Post cards: title, excerpt, date, tags, reading time
  - Tag filter bar (client component, URL search params)
  - Framer Motion staggered card entrance
- [ ] Post detail page (`/blog/[slug]`)
  - Render TipTap JSON to HTML
  - Syntax highlighting for code blocks (use lowlight/highlight.js)
  - Reading time display
  - Back to blog link
  - SEO: dynamic metadata from post title + excerpt

### 2D. Post enhancements
- [ ] Auto-calculate reading time on save (words / 200)
- [ ] Table of contents component (extract headings from TipTap JSON)
- [ ] SEO metadata generation (dynamic og:title, og:description per post)
- [ ] Add `publishedAt` date handling

---

## Track C: Contact Page

### 3A. Contact form UI
- [ ] Build `contact-form.tsx`
  - Fields: name, email, message
  - Client-side validation (required, email format)
  - Submit button with loading state
  - Success/error toast notification
  - Framer Motion: form fields animate in on mount
  - Blueprint grid background for the page

### 3B. API route + SQS (local)
- [ ] Build `/api/contact/route.ts`
  - Validate request body
  - Push message to SQS (using LocalStack endpoint in dev)
  - Return 200 immediately (decoupled from processing)
- [ ] Build SQS consumer script (`scripts/sqs-consumer.ts`)
  - Long-poll SQS queue
  - On message: write to DynamoDB contacts table
  - Delete message from queue after processing
  - Run as: `npx tsx scripts/sqs-consumer.ts`
- [ ] Test full flow: form → API → SQS → DynamoDB
- [ ] Verify in LocalStack: `awslocal sqs list-queues`, `awslocal dynamodb scan`

---

## Shared: Dockerize

### 4A. Docker setup
- [ ] Create `Dockerfile` (multi-stage: deps → build → production)
  - Base: node:20-alpine
  - Copy prisma schema, generate client
  - Build Next.js
  - Run as non-root user
- [ ] Update docker-compose.yml to include the app service
- [ ] Verify: `docker-compose up` starts everything
- [ ] Add `.dockerignore` (node_modules, .next, .git)
- [ ] Test: full app works via Docker (port 3000)

---

## Phase 1 complete when:
- [ ] Hero page loads with typing animation + particle background
- [ ] Skills section visible on scroll with blueprint aesthetic
- [ ] Blog posts can be created/edited in admin panel
- [ ] Blog listing and detail pages render correctly
- [ ] Contact form submits through SQS → DynamoDB locally
- [ ] Everything runs via docker-compose
- [ ] `npm run build` passes with zero errors
