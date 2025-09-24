# Multi-stage build for production optimization
# Use Node.js 22 LTS (Jod) - most recent LTS version with long-term support
# Debian Bookworm Slim is more secure than Alpine for production
FROM node:22.11.0-bookworm-slim AS base

# Install dependencies for building and runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Build stage
FROM node:22.11.0-bookworm-slim AS builder

# Install dependencies for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22.11.0-bookworm-slim AS runner

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs reactjs

# Install serve globally
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder --chown=reactjs:nodejs /app/dist ./dist

# Change ownership of the app directory
RUN chown -R reactjs:nodejs /app

# Switch to non-root user
USER reactjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
