# Chat Application

A real-time React + Node.js chat application using MongoDB and WebSockets. It supports direct messages, groups, friend requests, presence, typing indicators, delivery/read status, group administration, profile/group pictures, browser-side E2EE, and an AWS/GitHub Actions deployment pipeline.

## Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- WebSocket (`ws`)
- JWT + bcrypt
- Web Crypto API for E2EE
- Nginx + systemd on AWS EC2
- GitHub Actions + AWS OIDC + S3 + Systems Manager

## Project structure

```text
.github/workflows/       CI and AWS deployment workflows
aws/                     AWS IAM/EC2 deployment notes and bootstrap
deploy/                  Nginx, systemd, and deployment scripts
chat-api/                Express/WebSocket backend
client/                  React/Vite frontend
E2EE.md                  E2EE design notes
SECURITY.md              Security notes and limitations
```

## Local development

### Backend

```bash
cd chat-api
npm ci
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd client
npm ci
cp .env.example .env
npm run dev
```

Default development configuration:

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_HTTPS=false
```

## Production HTTP deployment

This project is intentionally configured to deploy using **HTTP and `ws://`**, not HTTPS/WSS.

The recommended AWS path is:

```text
GitHub
  -> GitHub Actions
  -> AWS OIDC
  -> S3 deployment artifact
  -> AWS Systems Manager
  -> EC2
  -> Nginx :80
  -> React + Node/WebSocket
  -> MongoDB Atlas
```

See `aws/README.md` for setup instructions.

### Production environment

Keep the backend environment file outside Git:

```text
/etc/chat-api.env
```

At minimum configure:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=...
KEY_ENCRYPTION_SECRET=...
ADMIN_EMAIL=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
CORS_ORIGIN=http://YOUR_SERVER_OR_DOMAIN
TRUST_PROXY=true
HTTPS=false
VITE_API_URL=http://YOUR_SERVER_OR_DOMAIN
VITE_WS_URL=ws://YOUR_SERVER_OR_DOMAIN
```

Never commit real credentials.

## CI/CD

`CI` runs on pull requests and pushes to `main`:

- installs locked dependencies
- runs backend tests
- runs a production dependency audit
- builds the frontend

`Deploy to AWS EC2` runs on pushes to `main` and:

1. Creates a deployment archive without `.env`, `node_modules`, or `dist`.
2. Uploads the archive to a private S3 bucket.
3. Uses GitHub OIDC instead of long-lived AWS access keys.
4. Uses AWS Systems Manager to tell the EC2 instance to retrieve the artifact.
5. Installs dependencies and builds the frontend.
6. Restarts the Node API through systemd.
7. Reloads Nginx.
8. Performs an API health check.

## Security

The project includes configurable CORS, Helmet, authentication rate limiting, request-size limits, WebSocket payload/rate limits, image validation, generalized production errors, and WebSocket authentication without placing the JWT in the URL.

See `SECURITY.md` for details.

### Important HTTP limitation

HTTP/WS is **not encrypted in transit**. Login credentials, JWT authentication traffic, WebSocket traffic, API metadata, and the application itself can be observed or modified by a network attacker. Browser-side E2EE protects encrypted message contents, but it does not make HTTP a secure transport.

For a real public production service, use HTTPS/WSS.

## E2EE

Messages use browser-side encryption. The server does not receive the user's private encryption key. See `E2EE.md` for the implementation and limitations.

## MongoDB

The application uses MongoDB collections for users, keys, friend requests, conversations, members, messages, broadcasts, and broadcast reads. Dropping a collection removes its documents; MongoDB can recreate collections when the application writes data again, but deleted data is not automatically restored.

## License

Educational/development project.

## Testing

The project includes automated backend and frontend tests, and the GitHub Actions CI workflow runs them before deployment.

### Backend tests

From `chat-api/`:

```bash
npm test
npm run test:coverage
```

The backend suite covers health checks, authentication and validation, broadcast APIs/services, group administration and membership rules, message retrieval, WebSocket authentication/broadcast delivery, protected routes, security headers, and rate limiting.

### Frontend tests

From `client/`:

```bash
npm test
```

The frontend suite uses Node's built-in test runner and covers authentication state, local storage, user/token persistence, and browser-side E2EE encryption/key wrapping.

### CI gate

GitHub Actions runs:

1. Backend tests
2. Backend dependency audit
3. Frontend tests
4. Frontend dependency audit
5. Frontend production build

A failed test, build, or high-severity dependency audit stops the deployment workflow from proceeding.
