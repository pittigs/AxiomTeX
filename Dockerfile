# Multi-Stage Dockerfile for AxiomTeX
# Fully compatible with multi-arch: linux/amd64, linux/arm64 (Apple Silicon, Raspberry Pi, AWS Graviton), linux/arm/v7

# Stage 1: Build the static web application
# Using --platform=$BUILDPLATFORM allows fast native compilation on the builder host without QEMU emulation
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Alpine (runs natively on target architecture: amd64, arm64, etc.)
FROM nginx:alpine

# Copy custom high-performance Nginx configuration (gzip, security headers, caching, /healthz)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check for container orchestrators (Docker Compose, Swarm, Kubernetes)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
