# Multi-stage Dockerfile for Rampart Demo Node.js App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Run as non-root user
USER node

COPY --chown=node:node package.json ./
RUN npm install --omit=dev

COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
