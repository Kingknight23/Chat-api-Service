# End-to-end encryption

New text messages use browser-side end-to-end encryption:

- Each browser creates a 3072-bit RSA-OAEP identity key pair with SHA-256.
- The private key is generated as non-extractable Web Crypto material and stored in IndexedDB on that browser/device.
- Only the public key is uploaded to the server.
- Each message generates a random AES-256-GCM key.
- The message is encrypted in the browser, and that AES key is wrapped separately for every conversation member using their public key.
- The server stores and relays the ciphertext and does not have the private keys needed to decrypt new E2EE messages.
- The existing 10-minute read cache never stores plaintext on the server; decrypted messages exist only in the browser's React state.

## Important deployment notes

This implementation protects message contents from the chat API/database and WebSocket server. A malicious or compromised web server could still ship modified JavaScript to a browser and attack the client, so production deployments should use HTTPS/WSS, strong CSP, dependency auditing, and a trusted release process.

The private key is device/browser-specific. If browser storage is cleared, that identity is lost and messages encrypted only to that key cannot be recovered. A future multi-device implementation should use separate device keys and a verified device-key directory instead of overwriting one account key.

Old messages created before this E2EE version may use the application's legacy server-side encryption format and are kept readable during migration. New messages are E2EE.
