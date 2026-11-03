# Build from the repository root. The runtime contains only Tank Clash, not other games or credentials.
FROM node:24-bookworm-slim AS preview
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY scripts/export-tank-review.mjs scripts/export-tank-review.mjs
COPY src/games/tank-clash src/games/tank-clash
COPY src/accessibility src/accessibility
RUN node scripts/export-tank-review.mjs

FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3223 TANK_STATIC_DIRECTORY=/app/preview/tank-clash
WORKDIR /app
COPY server/tank-clash-room/package.json server/tank-clash-room/package-lock.json server/tank-clash-room/
RUN npm ci --prefix server/tank-clash-room --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY server/tank-clash-room/*.mjs server/tank-clash-room/
COPY src/games/tank-clash/engine.ts src/games/tank-clash/protocol.ts src/games/tank-clash/room.ts src/games/tank-clash/
COPY --from=preview /build/preview/tank-clash/index.html preview/tank-clash/index.html
USER node
EXPOSE 3223
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/tank-clash-room/server.mjs"]
