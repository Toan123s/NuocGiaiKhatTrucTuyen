FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm ci

FROM dependencies AS builder

COPY backend backend
RUN npm run build -w backend

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=4000

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm ci --omit=dev

COPY --from=builder /app/backend/dist backend/dist
COPY --from=builder /app/backend/database/seed backend/database/seed

EXPOSE 4000

CMD ["npm", "run", "start", "-w", "backend"]