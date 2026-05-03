# syntax=docker/dockerfile:1.7

# Multi-stage build: node for the bundle, nginx-unprivileged for serving.
# nginxinc/nginx-unprivileged runs as uid 101 by default and writes its
# pid to /tmp, which lines up with the readOnlyRootFilesystem +
# emptyDir(/tmp) pattern in the kustomize base.
#
# Build-once / deploy-many: OIDC issuer + client id are injected at
# pod start (see deploy/container/40-render-runtime-config.sh) into
# /tmp/config.js, which nginx serves at /config.js. The SPA reads
# window.__RUNTIME_CONFIG__ from that file before the bundle boots.
# Nothing OIDC-specific is baked into the static assets.

# --- builder ---------------------------------------------------------------
FROM docker.io/library/node:20-alpine AS builder

# Empty string means "not in dev-auth mode" — production should never
# bake DEV_AUTH=true into the bundle. Default left empty so a CI typo
# can't accidentally ship the basic-auth UI.
ARG VITE_DEV_AUTH=
# DEV_MOCKS likewise must be empty in production builds.
ARG VITE_DEV_MOCKS=

ENV VITE_DEV_AUTH=$VITE_DEV_AUTH \
    VITE_DEV_MOCKS=$VITE_DEV_MOCKS

WORKDIR /app

# Copy manifests first so a code-only change doesn't bust the install
# cache layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- runtime ---------------------------------------------------------------
FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine

# envsubst (from gettext) is what 40-render-runtime-config.sh uses to
# materialize /tmp/config.js from the template at container start.
USER root
RUN apk add --no-cache gettext
USER 101

# Drop the default config; ours is mounted from the kustomize ConfigMap.
# Keeping the file in the image as a fallback so `docker run` without a
# mount still works for sanity checks.
COPY --chown=101:101 deploy/kustomize/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 --from=builder /app/dist /usr/share/nginx/html

# Runtime config: template lives in the image, the entrypoint hook
# renders it into /tmp/config.js (writable emptyDir in k8s) on every
# container start. /docker-entrypoint.d/*.sh is the supported extension
# point on the nginx-unprivileged base.
COPY --chown=101:101 deploy/container/config.js.template /etc/deploy-bot-ui/config.js.template
COPY --chown=101:101 --chmod=0755 deploy/container/40-render-runtime-config.sh /docker-entrypoint.d/40-render-runtime-config.sh

# nginx-unprivileged listens on 8080 by default. Document explicitly so
# operators reading `docker inspect` don't have to dig into the base.
EXPOSE 8080

# nginx-unprivileged ships its own non-root entrypoint that writes the
# pid to /tmp/nginx.pid and reloads via SIGHUP — no command override
# needed.
