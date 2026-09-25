FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 ffmpeg espeak font-dejavu

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN python3 scripts/generate-junior-videos.py
RUN test "$(find public/junior-ai/media -name 'mission-*-intro.mp4' | wc -l)" -eq 16 \
 && test "$(find public/junior-ai/media -name 'mission-*-intro.vtt' | wc -l)" -eq 16 \
 && test "$(find public/junior-ai/media -name 'mission-*-intro.txt' | wc -l)" -eq 16
RUN python3 scripts/generate-networking-videos.py
RUN test "$(find public/junior-networking/media -name 'mission-*-intro.mp4' | wc -l)" -eq 20 \
 && test "$(find public/junior-networking/media -name 'mission-*-intro.vtt' | wc -l)" -eq 20 \
 && test "$(find public/junior-networking/media -name 'mission-*-intro.txt' | wc -l)" -eq 20
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3030

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist

EXPOSE 3030

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -q -O - http://127.0.0.1:3030/healthz >/dev/null || exit 1

CMD ["node", "dist/server.cjs"]
