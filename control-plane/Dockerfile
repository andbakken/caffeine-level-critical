# Control plane – liten, privilegert provisjoneringstjeneste.
# Snakker med Docker-socketen (montert i compose) via dockerode.
FROM node:24-bookworm-slim
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

EXPOSE 8080
CMD ["npx", "tsx", "src/index.ts"]
