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

# Features

## Authentication

The current implementation uses a temporary authentication system for development.

The user ID is supplied through:

```http
Authorization: Bearer USER_ID


For WebSockets:

ws://localhost:5000/ws?token=USER_ID

This authentication system is only for local development.
```
# Architecture
The API is divided into REST and WebSocket layers.
| REST API | WebSocket |
| --- | --- |
| Route<br>↓<br>Middleware<br>↓<br>Controller<br>↓<br>Service<br>↓<br>Model<br>↓<br>MongoDB | Connection Manager<br>↓<br>Authentication<br>↓<br>WebSocket Router<br>↓<br>Handler<br>↓<br>Service<br>↓<br>MongoDB<br>↓<br>Connection Manager<br>↓<br>Other Users |

# Project Structure 
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

# Technologies

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




Production should use JWT or another trusted authentication provider.
