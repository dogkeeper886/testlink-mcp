FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment
ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]