# ==============================================================================
# BIZPRO+ BACKEND MULTI-STAGE DOCKERFILE
# Stage 1: Dependencies installation and Prisma Client generation
# Stage 2: Application compilation and production pruning
# Stage 3: Minimal, unprivileged runtime with dumb-init
# ==============================================================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS dependencies
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig*.json nest-cli.json ./
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# --- Stage 3: Runner ---
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat curl dumb-init
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create dedicated unprivileged non-root user and group
RUN addgroup -g 10001 -S nodejs && \
    adduser -S -u 10001 -G nodejs -s /bin/sh nodejs

# Copy pruned production dependencies, built artifacts, and Prisma schema
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

USER nodejs

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/api/health/live || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
