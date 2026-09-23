FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 ffmpeg espeak font-dejavu

COPY package*.json ./
RUN npm install

COPY . .
RUN python3 scripts/generate-junior-videos.py
RUN test "$(find public/junior-ai/media -name 'mission-*-intro.mp4' | wc -l)" -eq 16 \
 && test "$(find public/junior-ai/media -name 'mission-*-intro.vtt' | wc -l)" -eq 16 \
 && test "$(find public/junior-ai/media -name 'mission-*-intro.txt' | wc -l)" -eq 16
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
