# Build context is the repo root: build with
#   docker build -f apps/web/Dockerfile .
# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

COPY apps/web ./

# Vite inlines VITE_* at build time. CapRover passes app env vars as build args.
# Leave it unset/empty in production: the client then calls /api/... on the same domain.
ARG VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ---- serve ----
FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
