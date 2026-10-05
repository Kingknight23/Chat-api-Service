# Chat API

A reusable real-time chat backend built with Node.js, Express, MongoDB, and native WebSockets.

The API supports:

- One-to-one messaging
- Group messaging
- Friend requests
- Real-time presence
- Typing indicators
- Message delivery status
- Message read status
- Persistent admin broadcasts
- Broadcast read tracking
- Payload validation
- Message encryption
- WebSocket heartbeat/liveness checks
- Conversation history
- REST API endpoints
- Real-time WebSocket events

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Installation](#installation)
- [Running the API](#running-the-api)
- [Authentication](#authentication)
- [REST API](#rest-api)
  - [Friend Requests](#friend-requests)
  - [Direct Conversations](#direct-conversations)
  - [Groups](#groups)
  - [Conversations](#conversations)
  - [Messages](#messages)
  - [Broadcasts](#broadcasts)
- [WebSocket API](#websocket-api)
  - [Connection](#connection)
  - [Sending Messages](#sending-messages)
  - [Group Messaging](#group-messaging)
  - [Conversation Subscription](#conversation-subscription)
  - [Typing Indicators](#typing-indicators)
  - [Presence](#presence)
  - [Message Delivery Status](#message-delivery-status)
  - [Message Read Status](#message-read-status)
  - [Admin Broadcasts](#admin-broadcasts)
  - [Heartbeat](#heartbeat)
- [Encryption](#encryption)
- [Payload System](#payload-system)
- [Database Models](#database-models)
- [WebSocket Events Reference](#websocket-events-reference)
- [Development](#development)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

### Authentication

The current implementation uses a temporary authentication system for development.

The user ID is supplied through:

```http
Authorization: Bearer USER_ID
```

For WebSockets:

```
ws://localhost:5000/ws?token=USER_ID
```

> **Warning:** This authentication system is only for local development. Production should use JWT or another trusted authentication provider.

---

## Architecture

The API is divided into REST and WebSocket layers.

### REST API

```
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
MongoDB
```

### WebSocket

```
Connection Manager
  ↓
Authentication
  ↓
WebSocket Router
  ↓
Handler
  ↓
Service
  ↓
MongoDB
  ↓
Connection Manager
  ↓
Other Users
```

---

## Project Structure

```
chat-api/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── models/
│   │   ├── Broadcast.js
│   │   ├── BroadcastRead.js
│   │   ├── Conversation.js
│   │   ├── ConversationMember.js
│   │   ├── FriendRequest.js
│   │   ├── Message.js
│   │   └── UserKey.js
│   │
│   ├── routes/
│   │   ├── friend.routes.js
│   │   ├── group.routes.js
│   │   ├── broadcast.routes.js
│   │   ├── conversation.routes.js
│   │   └── message.routes.js
│   │
│   ├── controllers/
│   │   ├── friend.controller.js
│   │   ├── group.controller.js
│   │   ├── broadcast.controller.js
│   │   ├── conversation.controller.js
│   │   └── message.controller.js
│   │
│   ├── services/
│   │   ├── friend.service.js
│   │   ├── group.service.js
│   │   ├── broadcast.service.js
│   │   ├── conversation.service.js
│   │   ├── message.service.js
│   │   ├── message-status.service.js
│   │   ├── encryption.service.js
│   │   └── user.service.js
│   │
│   ├── websocket/
│   │   ├── websocket.server.js
│   │   ├── connection.manager.js
│   │   ├── heartbeat.js
│   │   ├── router.js
│   │   └── handlers/
│   │       ├── message.handler.js
│   │       ├── conversation.handler.js
│   │       ├── presence.handler.js
│   │       ├── read.handler.js
│   │       ├── typing.handler.js
│   │       ├── broadcast.handler.js
│   │       └── admin.handler.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── error.js
│   │   └── validation.js
│   │
│   └── payloads/
│       ├── text.js
│       ├── image.js
│       └── registry.js
│
└── tests/
```

---

## Technologies

- **Node.js** — JavaScript runtime
- **Express** — Web framework for REST API
- **MongoDB** — NoSQL database
- **Mongoose** — MongoDB object modeling
- **WebSocket (ws)** — Real-time communication
- **JavaScript ES Modules** — Modern module system
- **Helmet** — HTTP security headers
- **CORS** — Cross-Origin Resource Sharing
- **Morgan** — HTTP request logger
- **dotenv** — Environment variable management
- **Nodemon** — Auto-restart during development

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd chat-api
```

Install dependencies:

```bash
npm install
```

### Dependencies

Production dependencies:

```bash
npm install express mongoose cors dotenv helmet morgan ws
```

Development dependency:

```bash
npm install --save-dev nodemon
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chat-api
NODE_ENV=development
KEY_ENCRYPTION_SECRET=YOUR_SECRET
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Note:** Never commit `.env` to Git.

---

## Running the API

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The REST API runs on:

```
http://localhost:5000
```

The WebSocket server runs on:

```
ws://localhost:5000/ws
```

### Health Check

Request:

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "chat-api"
}
```

---

## Authentication

For REST requests:

```
Authorization: Bearer 100
```

The current development authentication treats `100` as the user ID.

For WebSockets:

```
ws://localhost:5000/ws?token=100
```

The special token:

```
admin
```

is currently treated as an administrator.

> **Warning:** This is temporary development authentication and must be replaced before production.

---

## REST API

### Friend Requests

#### Send Friend Request

```
POST /api/friends/request
Authorization: Bearer 100
Content-Type: application/json
```

```json
{
  "recipientId": "200"
}
```

The recipient receives a WebSocket event:

```json
{
  "type": "friend.request.received"
}
```

#### Accept Friend Request

```
POST /api/friends/request/REQUEST_ID/accept
Authorization: Bearer 200
```

Accepting a friend request creates a direct conversation.

#### Reject Friend Request

```
POST /api/friends/request/REQUEST_ID/reject
Authorization: Bearer 200
```

#### Get Friends

```
GET /api/friends
Authorization: Bearer 100
```

### Direct Conversations

A direct conversation is created when a friend request is accepted.

A direct conversation contains two users.

Example:

```
User 100
   │
   │ direct conversation
   │
User 200
```

### Groups

Groups require at least three users.

#### Create Group

```
POST /api/groups
Authorization: Bearer 100
Content-Type: application/json
```

```json
{
  "name": "Computer Mathematics",
  "userIds": ["200", "300"]
}
```

The resulting group contains:

```
100 → ADMIN
200 → MEMBER
300 → MEMBER
```

#### Add Group Member

Only group administrators can add members.

```
POST /api/groups/CONVERSATION_ID/members
Authorization: Bearer 100
Content-Type: application/json
```

```json
{
  "userId": "400"
}
```

#### Remove Group Member

```
DELETE /api/groups/CONVERSATION_ID/members/400
Authorization: Bearer 100
```

#### Leave Group

```
POST /api/groups/CONVERSATION_ID/leave
Authorization: Bearer 200
```

### Conversations

#### Get Conversations

```
GET /api/conversations
Authorization: Bearer 100
```

Returns conversations the authenticated user belongs to.

#### Get Conversation

```
GET /api/conversations/CONVERSATION_ID
Authorization: Bearer 100
```

### Messages

#### Get Conversation Messages

```
GET /api/conversations/CONVERSATION_ID/messages
Authorization: Bearer 100
```

Messages are returned in conversation history.

### Broadcasts

#### Get Broadcasts

```
GET /api/broadcasts
Authorization: Bearer 100
```

Returns persistent administrator broadcasts.

---

## WebSocket API

### Connection

Connect:

```
ws://localhost:5000/ws?token=100
```

After connecting, the server sends:

```json
{
  "type": "connection.ready",
  "data": {
    "userId": "100"
  }
}
```

### Sending Messages

Send:

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

The server validates the payload, encrypts it, stores it, and sends:

```json
{
  "type": "message.created",
  "data": {
    "messageId": "MESSAGE_ID",
    "conversationId": "CONVERSATION_ID",
    "senderId": "100",
    "messageType": "TEXT",
    "payloadType": "text",
    "payload": {
      "text": "Hello!"
    }
  }
}
```

### Group Messaging

The same `message.send` event is used for groups.

There is no separate group message event.

Example:

```
User 100
   │
   │ message.send
   ▼
Conversation
   │
   ├── User 100
   ├── User 200
   └── User 300
```

All group members receive:

```
message.created
```

> **Note:** Users do not currently need to subscribe to the conversation to receive messages.

### Conversation Subscription

Clients can subscribe to a conversation:

```json
{
  "type": "conversation.subscribe",
  "data": {
    "conversationId": "CONVERSATION_ID"
  }
}
```

The server responds:

```json
{
  "type": "conversation.subscribed",
  "data": {
    "conversationId": "CONVERSATION_ID"
  }
}
```

Unsubscribe:

```json
{
  "type": "conversation.unsubscribe",
  "data": {
    "conversationId": "CONVERSATION_ID"
  }
}
```

Subscriptions can be used by the frontend to track which conversation is currently open.

### Typing Indicators

Start typing:

```json
{
  "type": "typing.start",
  "data": {
    "conversationId": "CONVERSATION_ID"
  }
}
```

Stop typing:

```json
{
  "type": "typing.stop",
  "data": {
    "conversationId": "CONVERSATION_ID"
  }
}
```

Other members receive:

```json
{
  "type": "typing.start",
  "data": {
    "conversationId": "CONVERSATION_ID",
    "userId": "100"
  }
}
```

### Presence

Check whether a user is online:

```json
{
  "type": "presence.update",
  "data": {
    "userId": "200"
  }
}
```

Response:

```json
{
  "type": "presence.status",
  "data": {
    "userId": "200",
    "online": true
  }
}
```

The server also sends:

```
presence.online
presence.offline
```

### Message Delivery Status

When a message reaches another connected user, the server records the delivery.

The sender receives:

```json
{
  "type": "message.delivered",
  "data": {
    "messageId": "MESSAGE_ID",
    "conversationId": "CONVERSATION_ID",
    "userId": "200",
    "deliveredAt": "DATE"
  }
}
```

### Message Read Status

When a user reads a message:

```json
{
  "type": "message.read",
  "data": {
    "conversationId": "CONVERSATION_ID",
    "messageId": "MESSAGE_ID"
  }
}
```

The server responds:

```json
{
  "type": "message.read.confirmed",
  "data": {
    "conversationId": "CONVERSATION_ID",
    "messageId": "MESSAGE_ID"
  }
}
```

The sender receives:

```json
{
  "type": "message.read",
  "data": {
    "messageId": "MESSAGE_ID",
    "conversationId": "CONVERSATION_ID",
    "userId": "200",
    "readAt": "DATE"
  }
}
```

### Admin Broadcasts

Administrators can send system-wide messages.

The development admin connection is:

```
ws://localhost:5000/ws?token=admin
```

Send:

```json
{
  "type": "admin.broadcast",
  "data": {
    "payloadType": "text",
    "payload": {
      "text": "The system will be unavailable tonight."
    }
  }
}
```

The server stores the broadcast in MongoDB and sends:

```
admin.broadcast
```

to connected users.

#### Persistent Broadcasts

Admin broadcasts are stored in MongoDB.

This means broadcasts are not lost when users disconnect.

Broadcasts can also be retrieved through:

```
GET /api/broadcasts
Authorization: Bearer 100
```

#### Broadcast Read Tracking

The API uses the `BroadcastRead` model to track which users have seen which broadcasts.

Example:

```
Broadcast
----------------
ID: ABC123

BroadcastRead
----------------
broadcastId: ABC123
userId: 200
readAt: DATE
```

When the user sees a broadcast, the client sends:

```json
{
  "type": "admin.broadcast.read",
  "data": {
    "broadcastId": "ABC123"
  }
}
```

The server records the read status.

When the user reconnects, previously read broadcasts are not sent again.

The server sends only unread recent broadcasts.

#### Broadcast Architecture

```
                    ┌──────────────┐
                    │    Admin     │
                    └──────┬───────┘
                           │
                    admin.broadcast
                           │
                           ▼
                  ┌─────────────────┐
                  │    Broadcast    │
                  │    MongoDB      │
                  └────────┬────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
           User 100      User 200      User 300
             │             │             │
           reads         reads        unread
             │             │             │
             ▼             ▼             │
      BroadcastRead  BroadcastRead       │
                                         │
                                         ▼
                                  Sent on reconnect
```

This is a better design than simply sending the last 20 broadcasts every time someone connects.

> **Tip:** Consider adding an `unreadCount` to the broadcast response/WebSocket event, so the eventual frontend can show something like "3 new announcements" without having to calculate it itself.

### Heartbeat

The server uses WebSocket ping/pong messages to detect dead connections.

Every 30 seconds:

```
Server
  │
  │ ping
  ▼
Client
  │
  │ pong
  ▼
Server
```

If a connection does not respond, it is terminated.

This prevents stale connections from remaining in memory.

---

## Encryption

Messages use:

```
AES-256-GCM
```

for message payload encryption.

RSA is used to encrypt the AES key:

```
RSA-OAEP
SHA-256
3072-bit RSA
```

The general process is:

```
Message
   ↓
AES-256-GCM
   ↓
Encrypted message
   +
AES key
   ↓
RSA-OAEP
   ↓
Encrypted AES key for each user
```

The message database record contains the encrypted payload and encrypted AES keys.

### Important Encryption Note

The current encryption system is **not** true end-to-end encryption (E2EE).

The server currently stores an encrypted private key and can decrypt messages.

True E2EE should instead work like:

```
User A
Private Key ────────────────┐
                            │
User A message              │
    ↓                       │
Encrypt on device           │
    ↓                       │
Server                      │
    ↓                       │
Encrypted message           │
    ↓                       │
User B device               │
    ↓                       │
Decrypt with private key ───┘
```

A future version should keep private keys exclusively on user devices.

---

## Payload System

Messages use a payload registry.

Current payload types:

```
text
image
```

Example text:

```json
{
  "payloadType": "text",
  "payload": {
    "text": "Hello"
  }
}
```

Example image:

```json
{
  "payloadType": "image",
  "payload": {
    "url": "https://example.com/image.jpg",
    "width": 800,
    "height": 600
  }
}
```

Custom payload types can be added to the registry.

---

## Database Models

The API currently uses the following MongoDB models:

### UserKey

Stores encryption keys.

### FriendRequest

Stores friend requests and their status.

Statuses:

```
PENDING
ACCEPTED
REJECTED
```

### Conversation

Represents:

```
DIRECT
GROUP
BROADCAST
```

### ConversationMember

Connects users to conversations.

Also stores:

- role
- joined date
- last read message
- last read time

### Message

Stores messages.

Includes:

- conversation
- sender
- message type
- payload
- delivery information

### Broadcast

Stores persistent administrator broadcasts.

### BroadcastRead

Tracks which users have read which broadcasts.

---

## WebSocket Events Reference

### Connection

```
connection.ready
```

### Messages

```
message.send
message.created
message.delivered
message.read
message.read.confirmed
```

### Conversations

```
conversation.subscribe
conversation.subscribed
conversation.unsubscribe
conversation.unsubscribed
```

### Friends

```
friend.request.received
friend.request.accepted
friend.request.rejected
```

### Groups

```
group.created
group.member.added
group.member.removed
group.member.left
```

### Typing

```
typing.start
typing.stop
```

### Presence

```
presence.status
presence.online
presence.offline
```

### Admin

```
admin.broadcast
admin.broadcast.confirmed
admin.broadcast.read
admin.broadcast.read.confirmed
```

---

## Development

Start the server:

```bash
npm run dev
```

The server uses Nodemon during development and automatically restarts when source files change.

---

## Security Considerations

The current project is intended as a development implementation.

Before production:

- Replace temporary authentication with JWT/OAuth or another trusted authentication system.
- Validate authenticated user identities.
- Never trust user IDs supplied by clients.
- Implement true end-to-end encryption if required.
- Protect WebSocket authentication.
- Add rate limiting.
- Validate all payloads.
- Add request size limits.
- Add stronger CORS configuration.
- Protect environment variables.
- Add HTTPS/WSS.
- Add audit logging for administrator actions.
- Add authorization checks for every conversation operation.
- Add user existence validation.
- Add message spam protection.
- Add WebSocket connection limits.
- Add database indexes where required.

---

## Future Improvements

Planned improvements include:

- JWT authentication
- User service
- True end-to-end encryption
- Group administrator transfer
- Group rename
- Group deletion
- Friend pair canonicalization
- User existence validation
- Message pagination
- Unread message counts
- Broadcast pagination
- Broadcast notification counts
- WebSocket reconnect handling
- Request IDs/idempotency
- Rate limiting
- Redis for distributed WebSocket connections
- Automated tests
- API documentation
- Docker deployment
- Kubernetes deployment

---

## License

This project is for educational and development purposes.
