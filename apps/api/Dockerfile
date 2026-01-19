# Base image
FROM node:22-alpine AS base

# Prune stage
FROM base AS prune
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# Installer
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY --from=prune /app/out/json .
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY --from=installer /app/ .
COPY --from=prune /app/out/full/ .
COPY --from=prune /app/tsconfig.json .

# Build API (triggers db:generate)
RUN pnpm run build --filter=api

# Prune dev dependencies for production image
RUN pnpm prune --prod

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy the entire app with pruned node_modules
# This includes built artifacts (dist) and local package sources (needed for non-standard prisma output)
COPY --from=builder --chown=nestjs:nodejs /app .

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
