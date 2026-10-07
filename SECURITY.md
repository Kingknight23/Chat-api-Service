# Security notes

## Important

Do not commit `.env` files or production credentials. Rotate any credentials that were previously stored in this project archive or committed to Git.

## Current protections

- Passwords are hashed with bcrypt.
- JWT authentication is required for protected REST endpoints and WebSocket sessions.
- Helmet is enabled.
- CORS is configurable with `CORS_ORIGIN`.
- Authentication routes are rate limited.
- JSON request bodies are limited to 3 MB.
- WebSocket payloads are limited to 64 KB.
- WebSocket messages are rate limited per connection.
- Image payloads have size/type validation.
- Production API errors are generalized.
- WebSocket JWTs are sent in an authentication frame rather than the URL.
- Browser-side E2EE remains enabled for message contents.

## HTTP deployment limitation

The AWS deployment intentionally uses HTTP and `ws://` because that is the requested deployment mode. This is not secure for public production use because transport is unencrypted. E2EE does not protect passwords, JWTs, metadata, or the integrity of the JavaScript application delivered over HTTP.

## Recommended before real production use

- HTTPS/WSS
- HttpOnly/Secure/SameSite cookie authentication
- Stronger account protections and MFA
- Redis-backed rate limiting for multiple instances
- Object storage for uploaded images
- Malware/content scanning for uploads
- Centralized logging and monitoring
- Dependency scanning and automated vulnerability management
- Database backups and restore testing
- Content Security Policy and a controlled release process
