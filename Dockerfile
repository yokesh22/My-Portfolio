# syntax=docker/dockerfile:1

# ---------- Stage 1: deps — install dependencies ----------
FROM node:22-alpine AS deps
# Alpine is a tiny Linux; libc6-compat covers glibc bits some npm packages need.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy ONLY the manifests first → this layer is cached unless deps change.
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: builder — compile the app ----------
FROM node:22-alpine AS builder
WORKDIR /app
# Reuse the node_modules we just installed (no reinstall).
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# Bundle the SQS consumer into a single self-contained consumer.js (incl. AWS SDK)
# so the runner image can launch it as a separate "worker" container — no tsx,
# no extra node_modules needed at runtime.
RUN npm run build:consumer

# ---------- Stage 3: runner — the lean final image ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Run as a non-root user (security best practice — if the app is compromised,
# the attacker isn't root inside the container).
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
# Copy the three things the standalone server needs at runtime:
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# The bundled worker — run as a second container via:  docker run ... node consumer.js
COPY --from=builder --chown=nextjs:nodejs /app/consumer.js ./consumer.js
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# server.js is the minimal entrypoint standalone generated for us.
CMD ["node", "server.js"]
