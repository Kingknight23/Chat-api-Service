# HTTPS / WSS

The API supports HTTPS and the WebSocket server automatically uses WSS when HTTPS is enabled.

## API
Set in `chat-api/.env`:

```env
HTTPS=true
HTTPS_KEY_PATH=./certs/localhost-key.pem
HTTPS_CERT_PATH=./certs/localhost.pem
```

Create a trusted certificate for production. For local development, a self-signed certificate is acceptable, but the browser must trust it.

## Vite
Copy `client/.env.https.example` to `client/.env` and update the certificate paths.

For production, terminate TLS at a reverse proxy such as Nginx/Caddy and proxy HTTP/WebSocket traffic to the app. Do not commit private keys.

For local development with OpenSSL installed, from the project root:

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/localhost-key.pem -out certs/localhost.pem -days 365 -subj "/CN=localhost"
```

Then point both the API and Vite environment variables at those files. A browser will warn about an untrusted self-signed certificate until you trust it locally.
