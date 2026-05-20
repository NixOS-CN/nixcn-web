FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM caddy:2-alpine AS runtime
COPY --from=builder /app/dist /srv
EXPOSE 3000
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":3000"]
