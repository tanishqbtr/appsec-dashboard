# Use Node.js 20 LTS
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install ALL deps (dev + prod) for building
RUN npm ci
COPY . .
# Build client (Vite) and server bundle (esbuild)
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
# Install only production deps for runtime
RUN npm ci --omit=dev
# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "start"]