#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/chat-app
CLIENT_DIR=/var/www/chat-client
ENV_FILE=/etc/chat-api.env

mkdir -p "$APP_DIR" "$CLIENT_DIR"
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE"; exit 1; }

cd "$APP_DIR"
rm -rf chat-api client deploy
mv release/chat-api chat-api
mv release/client client
mv release/deploy deploy
rm -rf release

cd "$APP_DIR/chat-api"
npm ci --omit=dev

cd "$APP_DIR"
set -a
source "$ENV_FILE"
set +a

cat > client/.env.production <<EOT
VITE_API_URL=${VITE_API_URL}
VITE_WS_URL=${VITE_WS_URL}
VITE_HTTPS=false
EOT

cd client
npm ci
npm run build

rm -rf "$CLIENT_DIR/dist"
mkdir -p "$CLIENT_DIR"
cp -a dist "$CLIENT_DIR/dist"

cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/chat-app
ln -sf /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/chat-app
rm -f /etc/nginx/sites-enabled/default
cp "$APP_DIR/deploy/chat-api.service" /etc/systemd/system/chat-api.service
nginx -t
systemctl daemon-reload
systemctl enable chat-api
systemctl restart chat-api
systemctl reload nginx
curl --fail --silent http://127.0.0.1:5000/health >/dev/null

echo "Deployment completed successfully."
