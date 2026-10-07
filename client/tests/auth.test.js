import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { isAuthenticated, getCurrentUser } from "../src/utils/auth.js";
import { setToken, setUser } from "../src/utils/storage.js";

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};

beforeEach(() => store.clear());

test("isAuthenticated is false without a token", () => {
  assert.equal(isAuthenticated(), false);
});

test("isAuthenticated is true with a token", () => {
  setToken("signed-token");
  assert.equal(isAuthenticated(), true);
});

test("getCurrentUser returns the stored user", () => {
  const user = { id: "u1", username: "alice" };
  setUser(user);
  assert.deepEqual(getCurrentUser(), user);
});
