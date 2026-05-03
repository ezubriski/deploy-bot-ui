#!/bin/sh
# Renders /tmp/config.js from OIDC_ISSUER / OIDC_CLIENT_ID at container
# start. nginx serves it at /config.js (see nginx.conf) so the SPA reads
# fresh values on every pod start without a rebuild. Lives under
# /docker-entrypoint.d so the nginx-unprivileged base image runs it
# before launching nginx.
set -eu

: "${OIDC_ISSUER:=}"
: "${OIDC_CLIENT_ID:=deploy-bot-ui}"

export OIDC_ISSUER OIDC_CLIENT_ID

# Only $OIDC_ISSUER and $OIDC_CLIENT_ID are substituted — passing the
# allowlist to envsubst keeps a stray $foo in the template from being
# silently emptied.
envsubst '${OIDC_ISSUER} ${OIDC_CLIENT_ID}' \
  < /etc/deploy-bot-ui/config.js.template \
  > /tmp/config.js
