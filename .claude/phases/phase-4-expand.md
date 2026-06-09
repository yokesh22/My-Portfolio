# Phase 4 — Expand (Post-MVP)

> Only after Phases 1-3 are complete and the site is live.

## 4.1 Experience timeline page
- [ ] Route: `/experience`
- [ ] Visual timeline (vertical, scroll-animated)
- [ ] Each role expands into a mini case study with architecture diagram
  - Vidhai Technologies: OMR pipeline (3M+ sheets), AWS migration, on-prem DC
  - CoralAcademy / I4U Labs: Stripe billing, Zoom SDK, Supabase
- [ ] Blueprint aesthetic for the architecture diagrams

## 4.2 Projects showcase page
- [ ] Route: `/projects`
- [ ] Project cards: DistroLink, Crypy-Crypty, this portfolio
- [ ] Each card: description, tech stack tags, links (GitHub, live)
- [ ] "View architecture" toggle on each project

## 4.3 Infrastructure "under the hood" page
- [ ] Route: `/infrastructure`
- [ ] Live architecture diagram of this site's deployment
- [ ] Show: ALB, ASG, SQS flow, blue-green setup, CI/CD pipeline
- [ ] CloudWatch metrics integration (optional: display uptime, request count)
- [ ] This page IS the interview talking point

## 4.4 Domain + HTTPS + CDN
- [ ] Purchase domain (yokesh.dev or similar)
- [ ] Route 53 for DNS
- [ ] ACM certificate for HTTPS
- [ ] CloudFront CDN in front of ALB (cache static assets)
- [ ] Update NextAuth + CORS settings for production domain

## 4.5 Analytics + monitoring
- [ ] Visitor analytics → DynamoDB (page views, referrers)
- [ ] CloudWatch alarms: high CPU, unhealthy targets, 5xx errors
- [ ] Uptime monitoring (optional: simple cron health check)
