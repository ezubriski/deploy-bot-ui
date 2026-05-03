# syntax=docker/dockerfile:1.7

# Multi-stage build: node for the bundle, nginx-unprivileged for serving.
# nginxinc/nginx-unprivileged runs as uid 101 by default and writes its
# pid to /tmp, which lines up with the readOnlyRootFilesystem +
# emptyDir(/tmp) pattern in the kustomize base.
#
# Build args let CI bake VITE_* values into the bundle. They have to be
# arg, not env, because Vite reads them at compile time — there's no
# runtime substitution for the static assets.

# --- builder ---------------------------------------------------------------
FROM docker.io/library/node:20-alpine AS builder

ARG VITE_OIDC_ISSUER
ARG VITE_OIDC_CLIENT_ID
# Empty string means "not in dev-auth mode" — production should never
# bake DEV_AUTH=true into the bundle. Default left empty so a CI typo
# can't accidentally ship the basic-auth UI.
ARG VITE_DEV_AUTH=
# DEV_MOCKS likewise must be empty in production builds.
ARG VITE_DEV_MOCKS=

ENV VITE_OIDC_ISSUER=$VITE_OIDC_ISSUER \
    VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID \
    VITE_DEV_AUTH=$VITE_DEV_AUTH \
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

# Drop the default config; ours is mounted from the kustomize ConfigMap.
# Keeping the file in the image as a fallback so `docker run` without a
# mount still works for sanity checks.
COPY --chown=101:101 deploy/kustomize/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 --from=builder /app/dist /usr/share/nginx/html

# nginx-unprivileged listens on 8080 by default. Document explicitly so
# operators reading `docker inspect` don't have to dig into the base.
EXPOSE 8080

# nginx-unprivileged ships its own non-root entrypoint that writes the
# pid to /tmp/nginx.pid and reloads via SIGHUP — no command override
# needed.
