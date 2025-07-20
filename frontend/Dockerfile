

ARG NODE_VERSION=22.11.0


FROM node:${NODE_VERSION}-alpine AS base


RUN npm install -g bun@1.1.38

WORKDIR /app


FROM base as deps


COPY package.json bun.lock* ./


RUN bun install --frozen-lockfile --production


FROM base as build


COPY package.json bun.lock* ./


RUN bun install --frozen-lockfile


COPY . .


COPY .env* ./


RUN bun run build


FROM base as final

ENV NODE_ENV=production
ENV PORT=243

USER node


COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules


COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 243

CMD ["bun", "start", "--port", "243"]