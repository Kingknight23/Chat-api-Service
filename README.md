# Chat Application

A real-time chat application built with React, Node.js, Express, MongoDB, and native WebSockets.

## Features

- User registration and login with JWT authentication
- One-to-one and group messaging
- Friend requests and user search
- Real-time presence and typing indicators
- Message delivery and read status
- Administrator broadcasts with read tracking
- Group administration (create, rename, delete, manage members/admins)
- User and group profile pictures
- Browser-side end-to-end encryption (RSA-OAEP + AES-256-GCM)
- WebSocket heartbeat/liveness checks
- Conversation history
- Client-side read caching
- REST API and real-time WebSocket events
- Optional HTTPS/WSS support

## Architecture
```text
React
  |
  +--------------------+
  |                    |
  v                    v
REST API          WebSocket Client
  |                    |
  |                    |
  v                    v
Express            WebSocket Server
  |                    |
  +---------+----------+
            |
            v
        MongoDB
```

The browser performs message encryption/decryption before sending data to the server.

## Project Structure
```text
chat-app/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── api/            # REST API client
│       ├── components/     # UI components
│       ├── context/        # ChatContext
│       ├── pages/          # Login, Register, Chat
│       ├── utils/          # auth, e2ee, storage, formatDate
│       └── websocket/      # WebSocket client
│
├── chat-api/               # Node.js/Express backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── payloads/
│       ├── routes/
│       ├── services/
│       ├── websocket/
│       ├── app.js
│       └── server.js
│
├── E2EE.md
└── README.md
```


## Technologies

**Frontend:** React, Vite, Web Crypto API, Native WebSocket API

**Backend:** Node.js, Express, MongoDB, Mongoose, ws, JWT, bcrypt, Helmet, CORS, Morgan, dotenv, Nodemon

## Installation

```bash
git clone <repository-url>
cd chat-app
```

Backend:
```bash
cd chat-api
npm install
```
Frontend:
```bash
cd ../client
npm install
```
## Environment Variables
Backend (`chat-api/.env`):
 ```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chat-api
NODE_ENV=development
JWT_SECRET=YOUR_JWT_SECRET
KEY_ENCRYPTION_SECRET=YOUR_KEY_ENCRYPTION_SECRET
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
HTTPS=false # turn this true for HTTPS
HTTPS_KEY_PATH=./certs/localhost-key.pem # optional
HTTPS_CERT_PATH=./certs/localhost.pem # optional
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Frontend (`chat-api/.env`):
 ```env
# HTTP development
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_HTTPS=false

# HTTPS/WSS
# VITE_API_URL=https://localhost:5000
# VITE_WS_URL=wss://localhost:5000
# VITE_HTTPS=true
```

Never commit `.env` to Git.

> **Note:** Never commit `.env` to Git.

---

## Running the Application

1. **Start MongoDB** (default: `mongodb://127.0.0.1:27017/chat-api`)

2. **Start backend:**

   ```bash
   cd chat-api
   npm run dev
   ```

Runs on `http://localhost:5000` (WS: `ws://localhost:5000/ws`)

3. **Start frontend:**
   ```bash
   cd chat-api
   npm run dev
   ```
4. **Health check:** `GET /health` → `{ "status": "ok", "service": "chat-api" }`
   ## Authentication
   JWT-based. Register or login to receive a token, then include it in requests:
   
    Authorization: Bearer JWT_TOKEN


**Register:** POST `/api/auth/register`

```json
{ "username": "john", "email": "john@example.com", "password": "password123" }
```
Login: `POST` `/api/auth/login`

```json
{ "email": "john@example.com", "password": "password123" }
```
## REST API
## Users
|Method	|Endpoint |	Description |
--------|---------|-------------|
|GET	  |`/api/users/me`	|Get current user|
|PATCH	|`/api/users/me` |	Update | username, email, password, or profile picture |

## Friends
|Method	|Endpoint |	Description |
--------|---------|-------------|
| GET	| `/api/friends/search`	| Search users |
| POST	| `/api/friends/requests`	|Send friend request |
| GET	| `/api/friends/requests/incoming` |	Incoming requests |
| POST	| `/api/friends/requests/:id/accept` |	Accept request |
| POST	| `/api/friends/requests/:id/reject` |	Reject request |
|GET	| `api/friends` |	List friends |
## Conversations 
|Method	|Endpoint |	Description |
|--------|---------|-------------|
| GET	|`/api/conversations` |	List user's conversations |
| GET  |	`/api/conversations/:id` |	Get conversation |
| POST	| `/api/conversations/direct` |	Open direct conversation |
| GET	| ` /api/conversations/:id/messages`|Message history |
## Groups
|Method	|Endpoint |	Description |
|--------|---------|-------------|
| POST	| `/api/groups `	|Create group (min. 3 users; creator becomes ADMIN) |
| PATCH	| `/api/groups/:id` |	Rename or change picture (admin only)|
| DELETE | `	/api/groups/:id` |	Delete group (admin only) |
| POST	| `/api/groups/:id/members`	| Add member (admin only) |
|DELETE | `	/api/groups/:id/members/:userId` |	Remove member (admin only) |
|PATCH |	`/api/groups/:id/members/:userId/admin` |	Promote to admin |
| POST |	`/api/groups/:id/leave` |	Leave group |
## Encryption Keys
|Method	|Endpoint |	Description |
|--------|---------|-------------|
| PUT	| `/api/keys/public` |	Upload public key |
| GET	| `/api/keys/conversation/:id` |	Get conversation member keys |
## Broadcasts
|Method	|Endpoint |	Description |
|--------|---------|-------------|
| GET	| `/api/broadcasts` |	Get persistent admin broadcasts |

## WebSocket API
Endpoint: `ws://localhost:5000/ws` (or `wss://` with HTTPS)

Authenticate with JWT on connect. Server responds with connection.ready.

### Send message:
```json
{
  "type": "message.send",
  "data": {
    "conversationId": "CONVERSATION_ID",
    "payloadType": "text",
    "payload": {
      "text": "Hello!"
    }
  }
}
```
### Subscribe/unsubscribe:

```json
{ "type": "conversation.subscribe", "data": { "conversationId": "ID" } }
{ "type": "conversation.unsubscribe", "data": { "conversationId": "ID" } }
```
### Typing:

```json
{ "type": "typing.start", "data": { "conversationId": "ID" } }
{ "type": "typing.stop", "data": { "conversationId": "ID" } }
```
### Read receipt:
```json
{ "type": "message.read", "data": { "conversationId": "ID", "messageId": "ID" } }
```
## WebSocket Events
|Category	|Events |
|---------|-------|
|Connection |	`connection.ready`
|Messages	| `message.send`, `message.created`, `message.delivered`, `message.read`, `message.read.confirmed`
|Conversations	| `conversation.subscribe`, `conversation.subscribed`, `conversation.unsubscribe`, `conversation.unsubscribed`
|Friends	| `friend.request.received`, `friend.request.accepted`, `friend.request.rejected`
|Groups	| `group.created`, `group.updated`, `group.deleted`, `group.member.added`, `group.member.removed`, `group.member.left`
|Typing |	`typing.start`, `typing.stop`
|Presence |	`presence.status`, `presence.online`, `presence.offline`
|Broadcasts	| `admin.broadcast`, `admin.broadcast. confirmed`, `admin.broadcast.read`, `admin.broadcast.read.confirmed`

The server uses ping/pong heartbeats to detect and terminate dead connections.

### End-to-End Encryption
Each browser generates a 3072-bit RSA-OAEP (SHA-256) key pair:

Private key → stored locally in IndexedDB

Public key → uploaded to server

#### Message flow:

- Generate a new AES-256-GCM key per message

- Encrypt the message with AES

- Encrypt the AES key for each member with their RSA public key

- Send to server → store in MongoDB → deliver via WebSocket

- Recipient decrypts AES key with RSA, then decrypts the message

- The server never receives private keys. See E2EE.md for details.

**Note:** *Private keys are browser/device-specific. Clearing browser storage loses the key. Multi-device key management is not implemented.*

## Caching
The client uses an in-memory read cache (~10 min TTL) for conversations, friend requests, and related data. WebSocket updates invalidate cached entries. The cache clears on auth context changes and does not replace MongoDB persistence.

## Database Models
| Model |	Purpose |
|--------|--------|
|User |	Username, email, password hash, profile picture, role
|UserKey |	Public encryption key info
|FriendRequest |	requester, recipient, status (`PENDING`/`ACCEPTED`/`REJECTED`)
|Conversation |	Type (`DIRECT`/`GROUP`/`BROADCAST`), name, picture, creator
|ConversationMember	 | User, role (`MEMBER`/`ADMIN`), last read info
|Message |	Conversation, sender, type, payload, delivery info
|Broadcast |	Persistent admin broadcasts
|BroadcastRead |	Tracks broadcast read status per user

## HTTPS and WSS
Optional for local development; recommended for production.

- HTTP dev: `HTTPS=false`, `VITE_API_URL=http://...`, `VITE_WS_URL=ws://...`

- HTTPS dev: `HTTPS=true` with cert paths, `VITE_API_URL=https://...`, `VITE_WS_URL=wss://...`

For production, terminate TLS with a reverse proxy (Nginx, Caddy) and forward to Node.js

## Deployment
```bash
# Backend
cd chat-api && npm run dev

# Frontend
cd client && npm run dev

# Build frontend
npm run build

# Preview production build
npm run preview
```
