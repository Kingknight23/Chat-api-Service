const DB_NAME = "chatapp-e2ee";
const DB_VERSION = 1;
const STORE_NAME = "identities";
const LEGACY_PREFIX = "chatapp.e2ee.private.v1.";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const bytesToBase64 = (bytes) => {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
};

const base64ToBytes = (value) => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

const openDatabase = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
            request.result.createObjectStore(STORE_NAME);
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const readIdentity = async (userId) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, "readonly")
            .objectStore(STORE_NAME).get(String(userId));
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

const writeIdentity = async (userId, value) => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, "readwrite")
            .objectStore(STORE_NAME).put(value, String(userId));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const importPrivateKey = (jwk) => crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
);

const ensureIdentityKey = async (userId) => {
    if (!userId || !window.crypto?.subtle || !window.indexedDB) {
        throw new Error("This browser does not support the required E2EE storage APIs");
    }

    const stored = await readIdentity(userId);
    if (stored?.privateKey && stored?.publicKey) return stored;

    // Migrate the previous v1 localStorage format into IndexedDB, then discard
    // the extractable private JWK so the new key is non-extractable in JS.
    const legacyRaw = localStorage.getItem(`${LEGACY_PREFIX}${userId}`);
    if (legacyRaw) {
        try {
            const legacy = JSON.parse(legacyRaw);
            if (legacy.privateKey && legacy.publicKey) {
                const privateKey = await importPrivateKey(legacy.privateKey);
                const value = { privateKey, publicKey: legacy.publicKey };
                await writeIdentity(userId, value);
                localStorage.removeItem(`${LEGACY_PREFIX}${userId}`);
                return value;
            }
        } catch (error) {
            console.warn("Unable to migrate the previous E2EE identity:", error);
        }
    }

    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 3072,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        false,
        ["encrypt", "decrypt"]
    );

    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const value = { privateKey: keyPair.privateKey, publicKey };
    await writeIdentity(userId, value);
    return value;
};

const importPublicKey = (jwk) => crypto.subtle.importKey(
    "jwk",
    typeof jwk === "string" ? JSON.parse(jwk) : jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
);

const encryptForRecipients = async (payload, publicKeys) => {
    const recipients = Object.entries(publicKeys || {});
    if (!recipients.length) throw new Error("No encryption keys are available for this conversation");

    const aesKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        textEncoder.encode(JSON.stringify(payload))
    );
    const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
    const encryptedKeys = {};

    for (const [userId, publicJwk] of recipients) {
        const publicKey = await importPublicKey(publicJwk);
        const wrapped = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" }, publicKey, rawAesKey
        );
        encryptedKeys[userId] = bytesToBase64(new Uint8Array(wrapped));
    }

    return {
        e2eeVersion: 1,
        algorithm: "AES-256-GCM",
        keyAlgorithm: "RSA-OAEP-SHA256",
        ciphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
        iv: bytesToBase64(iv),
        encryptedKeys
    };
};

const decryptPayload = async (encryptedPayload, userId) => {
    if (!encryptedPayload?.e2eeVersion) return null;

    const identity = await ensureIdentityKey(userId);
    const encryptedKey = encryptedPayload.encryptedKeys?.[userId];
    if (!encryptedKey) throw new Error("This message is not encrypted for this device");

    const rawAesKey = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" }, identity.privateKey, base64ToBytes(encryptedKey)
    );
    const aesKey = await crypto.subtle.importKey(
        "raw", rawAesKey, { name: "AES-GCM" }, false, ["decrypt"]
    );
    const plaintextBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToBytes(encryptedPayload.iv) },
        aesKey,
        base64ToBytes(encryptedPayload.ciphertext)
    );
    return JSON.parse(textDecoder.decode(plaintextBuffer));
};

const getIdentityPublicKey = async (userId) =>
    (await ensureIdentityKey(userId)).publicKey;

export {
    ensureIdentityKey,
    getIdentityPublicKey,
    encryptForRecipients,
    decryptPayload
};
