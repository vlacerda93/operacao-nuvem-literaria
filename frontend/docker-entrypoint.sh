#!/bin/sh
set -eu

export PORT="${PORT:-80}"
API_URL="${VITE_API_URL:-}"
ESCAPED_API_URL=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_URL: "${ESCAPED_API_URL}"
};
EOF

envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
