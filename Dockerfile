# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for NEXT_PUBLIC_* variables (baked into JS bundle)
ARG NEXT_PUBLIC_HCS_TOPIC_ID
ARG NEXT_PUBLIC_AUTH0_REDIRECT_URI
ARG NEXT_PUBLIC_AUTH0_POST_LOGOUT_REDIRECT_URI

# Set as environment variables for the build process
ENV NEXT_PUBLIC_HCS_TOPIC_ID=$NEXT_PUBLIC_HCS_TOPIC_ID
ENV NEXT_PUBLIC_AUTH0_REDIRECT_URI=$NEXT_PUBLIC_AUTH0_REDIRECT_URI
ENV NEXT_PUBLIC_AUTH0_POST_LOGOUT_REDIRECT_URI=$NEXT_PUBLIC_AUTH0_POST_LOGOUT_REDIRECT_URI

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]