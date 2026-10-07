import test from "node:test";
import assert from "node:assert/strict";
import { encryptForRecipients } from "../src/utils/e2ee.js";

const decodeBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

test("E2EE encrypts a payload with AES-256-GCM and wraps the key for recipients", async () => {
  const recipient = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", recipient.publicKey);
  const payload = { text: "hello secure world", messageType: "text" };

  const encrypted = await encryptForRecipients(payload, { user2: publicJwk });

  assert.equal(encrypted.e2eeVersion, 1);
  assert.equal(encrypted.algorithm, "AES-256-GCM");
  assert.equal(encrypted.keyAlgorithm, "RSA-OAEP-SHA256");
  assert.ok(encrypted.ciphertext);
  assert.ok(encrypted.iv);
  assert.ok(encrypted.encryptedKeys.user2);

  const rawAesKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    recipient.privateKey,
    decodeBase64(encrypted.encryptedKeys.user2)
  );
  assert.equal(new Uint8Array(rawAesKey).byteLength, 32);

  const aesKey = await crypto.subtle.importKey("raw", rawAesKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64(encrypted.iv) },
    aesKey,
    decodeBase64(encrypted.ciphertext)
  );
  assert.deepEqual(JSON.parse(new TextDecoder().decode(plaintext)), payload);
});

test("E2EE rejects encryption when no recipient keys are available", async () => {
  await assert.rejects(
    () => encryptForRecipients({ text: "hello" }, {}),
    /No encryption keys are available/
  );
});
