FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN npm ci -w @hayastani/api -w @hayastani/shared
RUN npm run build -w @hayastani/shared
RUN npm run db:generate -w @hayastani/api
RUN npm run build -w @hayastani/api

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/shared ./packages/shared
ENV NODE_ENV=production
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
