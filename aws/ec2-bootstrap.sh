#!/usr/bin/env bash
set -euo pipefail

# Ubuntu 22.04/24.04 EC2 bootstrap.
# Attach AmazonSSMManagedInstanceCore to the EC2 instance role before running this.

apt-get update
apt-get install -y nginx curl unzip awscli

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

mkdir -p /opt/chat-app /var/www/chat-client
chown -R ubuntu:ubuntu /opt/chat-app /var/www/chat-client

systemctl enable nginx
systemctl restart nginx

cat >/etc/chat-api.env <<'ENV'
PORT=5000
NODE_ENV=production
MONGO_URI=REPLACE_ME
JWT_SECRET=REPLACE_ME_WITH_A_RANDOM_32_PLUS_CHARACTER_SECRET
KEY_ENCRYPTION_SECRET=REPLACE_ME_WITH_A_RANDOM_32_PLUS_CHARACTER_SECRET
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=REPLACE_ME
CORS_ORIGIN=http://REPLACE_ME
TRUST_PROXY=true
HTTPS=false
VITE_API_URL=http://REPLACE_ME
VITE_WS_URL=ws://REPLACE_ME
ENV
chmod 600 /etc/chat-api.env
chown root:root /etc/chat-api.env

echo "Bootstrap complete. Edit /etc/chat-api.env with real values, then run the deployment workflow."
