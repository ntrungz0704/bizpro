# ==============================================================================
# BIZPRO+ FRONTEND MULTI-STAGE DOCKERFILE (NEXT.JS 15 STANDALONE)
# Stage 1: Dependency installation
# Stage 2: Next.js standalone build compilation
# Stage 3: Ultra-minimal unprivileged production runtime
# ==============================================================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=/api

RUN npm run build

# --- Stage 3: Runner ---
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init wget
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Dedicated unprivileged non-root user
RUN addgroup -g 10001 -S nodejs && \
    adduser -S -u 10001 -G nodejs -s /bin/sh nextjs

# Set correct permissions for Next.js cache and standalone output
RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
