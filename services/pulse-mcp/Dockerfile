FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

EXPOSE 3333

CMD ["pnpm", "start"]
