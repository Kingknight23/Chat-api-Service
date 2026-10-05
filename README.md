# Chat API

A real-time messaging backend built with **Node.js, Express, MongoDB, and WebSocket (`ws`)**.

The Chat API provides the backend infrastructure for a WhatsApp-like messaging application, supporting one-to-one conversations, group conversations, friend requests, administrative broadcasts, real-time presence, typing indicators, message status, and encrypted messages.

## Features

* 🔐 JWT-based authentication
* 👤 User management
* 🤝 Friend requests and friend management
* 💬 One-to-one messaging
* 👥 Group conversations
* 📢 Admin/system broadcasts
* ⚡ Real-time communication using WebSocket
* 🔒 RSA-based message encryption
* 📨 Message delivery and read status
* 🟢 Online/offline presence
* ✍️ Typing indicators
* ❤️ WebSocket heartbeat/ping system
* 🗄️ MongoDB database
* ✅ Request validation with Zod
* 🛡️ Security middleware with Helmet
* 🚦 Centralized error handling
* 📦 Modular service/controller architecture

---

## Architecture

The project follows a layered backend architecture:



### REST API

REST endpoints are responsible for operations such as:

* Creating and managing conversations
* Sending messages
* Managing friends
* Creating and managing groups
* Managing broadcasts

### WebSocket

WebSocket is responsible for real-time events such as:

* New messages
* Message delivery
* Read receipts
* Typing indicators
* Presence updates
* Friend request notifications
* Administrative broadcasts

The project uses the native **`ws` WebSocket library** rather than Socket.IO.

---

## Project Structure

```text
chat-api/
│
├── .env
├── .env.example
├── package.json
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── broadcast.controller.js
│   │   ├── conversation.controller.js
│   │   ├── friend.controller.js
│   │   ├── group.controller.js
│   │   └── message.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── error.js
│   │   └── validation.js
│   │
│   ├── models/
│   │   ├── Broadcast.js
│   │   ├── Conversation.js
│   │   ├── ConversationMember.js
│   │   ├── FriendRequest.js
│   │   ├── Message.js
│   │   └── UserKey.js
│   │
│   ├── payloads/
│   │   ├── image.js
│   │   ├── registry.js
│   │   └── text.js
│   │
│   ├── routes/
│   │   ├── broadcast.routes.js
│   │   ├── conversation.routes.js
│   │   ├── friend.routes.js
│   │   ├── group.routes.js
│   │   └── message.routes.js
│   │
│   ├── services/
│   │   ├── broadcast.service.js
│   │   ├── conversation.service.js
│   │   ├── encryption.service.js
│   │   ├── friend.service.js
│   │   ├── group.service.js
│   │   ├── message-status.service.js
│   │   ├── message.service.js
│   │   └── user.service.js
│   │
│   └── websocket/
│       ├── connection.manager.js
│       ├── heartbeat.js
│       ├── router.js
│       ├── websocket.server.js
│       │
│       └── handlers/
│           ├── admin.handler.js
│           ├── conversation.handler.js
│           ├── message.handler.js
│           ├── presence.handler.js
│           ├── read.handler.js
│           └── typing.handler.js
│
└── tests/
```

---

## Technology Stack

| Technology       | Purpose                              |
| ---------------- | ------------------------------------ |
| Node.js          | Runtime                              |
| Express          | REST API                             |
| MongoDB          | Database                             |
| Mongoose         | MongoDB ODM                          |
| WebSocket (`ws`) | Real-time communication              |
| JWT              | Authentication                       |
| bcrypt           | Password hashing                     |
| Zod              | Request validation                   |
| Helmet           | HTTP security                        |
| CORS             | Cross-origin requests                |
| Morgan           | HTTP request logging                 |
| Redis / ioredis  | Caching and real-time infrastructure |
| UUID             | Unique identifiers                   |
| Jest             | Testing                              |
| Supertest        | API testing                          |
| Nodemon          | Development server                   |

---

# Getting Started

## Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MongoDB
* Git

Check your versions:

```bash
node --version
npm --version
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd chat-api
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the `chat-api` directory.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chat-api
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Use `.env.example` as a template.

**Do not commit `.env` to Git.**

---

# Running the Application

## Development

Start the development server:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

The WebSocket server runs on the configured server port.

## Production

Start the application with:

```bash
npm start
```

---

# API Structure

The API is divided into several resource areas.

## Authentication

Authentication is handled using JWT.

Protected requests require a valid token.

Example:

```http
Authorization: Bearer <token>
```

---

## Conversations

Conversation endpoints handle one-to-one and group conversation data.

Example operations:

```text
GET    /api/conversations
GET    /api/conversations/:id
POST   /api/conversations
```

A conversation can contain:

* Two users for a direct conversation
* Multiple users for a group conversation
* The administrative conversation

---

## Friends

Users can connect with each other using friend requests.

Typical flow:

```text
User A
  │
  │ Send friend request
  ▼
User B
  │
  │ Accept / Reject
  ▼
Friend relationship
```

Friend requests are also delivered through WebSocket so the recipient can receive the request without refreshing the application.

---

## Groups

Groups support conversations involving more than two users.

Group functionality includes:

* Creating a group
* Adding members
* Removing members
* Sending group messages
* Receiving group messages in real time

---

## Messages

Messages support different payload types.

Current payload structure includes:

```text
payloads/
├── text.js
├── image.js
└── registry.js
```

This allows the API to support different message types while keeping the message system extensible.

---

# WebSocket

The application uses WebSocket for real-time communication.

Connection:

```text
ws://localhost:5000
```

Authenticated clients establish a WebSocket connection and register their connection with the connection manager.

## WebSocket Components

### Connection Manager

`connection.manager.js`

Responsible for tracking active user connections.

```text
User
  │
  └── WebSocket Connection
          │
          └── Connection Manager
```

This allows messages and events to be routed to the correct users.

### Heartbeat

`heartbeat.js`

The server periodically checks whether WebSocket connections are still alive.

```text
Server ── ping ──> Client
Server <─ pong ── Client
```

Inactive connections can be removed to prevent stale connections from consuming server resources.

### WebSocket Router

`router.js`

Routes incoming WebSocket events to the appropriate handler.

### Handlers

```text
handlers/
├── admin.handler.js
├── conversation.handler.js
├── message.handler.js
├── presence.handler.js
├── read.handler.js
└── typing.handler.js
```

Each handler is responsible for a specific category of real-time events.

---

# Real-Time Events

The WebSocket layer supports events such as:

### Messages

```text
message.send
message.new
message.delivered
message.read
```

### Presence

```text
presence.online
presence.offline
```

### Typing

```text
typing.start
typing.stop
```

### Friend Requests

```text
friend.request
friend.accepted
friend.rejected
```

### Conversations

```text
conversation.created
conversation.updated
```

### Administration

```text
broadcast.new
```

The exact event names should follow the implementation in the WebSocket router and handlers.

---

# Message Encryption

The API includes an encryption service:

```text
src/services/encryption.service.js
```

The project uses RSA public/private key cryptography for message encryption.

User keys are represented by:

```text
UserKey.js
```

The general concept is:

```text
Sender
  │
  │ Encrypt message using
  │ recipient's public key
  ▼
Encrypted message
  │
  ▼
Server / Database
  │
  ▼
Recipient
  │
  │ Decrypt using
  │ private key
  ▼
Plaintext message
```

Private keys should never be exposed to other users.

---

# Message Status

The message status service tracks the lifecycle of a message.

```text
Sent
  │
  ▼
Delivered
  │
  ▼
Read
```

The implementation is handled by:

```text
src/services/message-status.service.js
```

---

# Broadcast System

The broadcast system allows administrators to send system-wide messages.

Broadcast functionality is separated from normal user-to-user messaging.

```text
Administrator
      │
      ▼
Broadcast Service
      │
      ▼
Connected Users
```

Broadcasts can be stored using the `Broadcast` model and delivered to connected clients through WebSocket.

---

# Database Models

The application uses MongoDB with Mongoose.

### User

Stores user account information.

### Conversation

Stores conversation-level information.

### ConversationMember

Stores the relationship between users and conversations.

### FriendRequest

Stores pending and completed friend requests.

### Message

Stores messages associated with conversations.

### UserKey

Stores public-key information required by the encryption system.

### Broadcast

Stores administrative/system broadcasts.

---

# Error Handling

Errors are handled through centralized middleware:

```text
src/middleware/error.js
```

This prevents controllers and routes from having to implement duplicate error-handling logic.

Typical response format:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# Validation

Request validation is handled through:

```text
src/middleware/validation.js
```

Zod schemas are used to validate incoming request data before it reaches the application logic.

This helps prevent invalid data from reaching controllers and services.

---

# Testing

Tests are located in:

```text
tests/
```

The project uses:

* Jest
* Supertest

Run tests with:

```bash
npm test
```

---

# Development Principles

The project is designed around separation of responsibilities.

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
MongoDB
```

### Routes

Define API endpoints.

### Middleware

Handle authentication, validation, security, and errors.

### Controllers

Handle HTTP requests and responses.

### Services

Contain the application's business logic.

### Models

Define database schemas.

### WebSocket Handlers

Handle real-time events.

This structure makes the backend easier to test, maintain, and extend.

---

# Future Improvements

Potential future features include:

* [ ] Message reactions
* [ ] Message editing and deletion
* [ ] File and video messages
* [ ] Voice messages
* [ ] Message search
* [ ] Pagination
* [ ] User blocking
* [ ] Group administrators
* [ ] Group permissions
* [ ] Push notifications
* [ ] Redis-based scaling
* [ ] Rate limiting
* [ ] End-to-end encryption improvements
* [ ] Docker deployment
* [ ] Kubernetes deployment
* [ ] CI/CD pipeline
* [ ] Automated integration tests
* [ ] API documentation with Swagger/OpenAPI

---

# Security

The project includes several security mechanisms:

* Password hashing with bcrypt
* JWT authentication
* AES + RSA encryption
* HTTP security headers through Helmet
* Request validation
* CORS configuration
* Environment variables for secrets
* WebSocket heartbeat checks

Sensitive information such as:

```text
.env
JWT secrets
private encryption keys
database credentials
```

should never be committed to the repository.

---

# Git

The project includes a `.gitignore` file to prevent sensitive and unnecessary files from being committed.

Before committing, verify that `.env` is ignored:

```bash
git status
```

---

# License

This project is currently intended for educational and portfolio purposes.

Add an appropriate license before distributing the project publicly.
