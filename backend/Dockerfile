# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY build.js ./
COPY src ./src
COPY prisma ./prisma/

# Install deps
RUN npm ci

# Generate Prisma client
ARG DATABASE_URL
RUN DATABASE_URL=$DATABASE_URL npx prisma generate

# Build with esbuild
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy built files and Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY prisma ./prisma

# Expose port
EXPOSE 5000

# Start
CMD ["node", "dist/index.js"]
