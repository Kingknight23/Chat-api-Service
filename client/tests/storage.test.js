import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getToken, setToken, removeToken, getUser, setUser, removeUser, clearAuth } from "../src/utils/storage.js";

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};

beforeEach(() => store.clear());

test("token storage round trip", () => {
  assert.equal(getToken(), null);
  setToken("abc123");
  assert.equal(getToken(), "abc123");
  removeToken();
  assert.equal(getToken(), null);
});

test("user storage round trip preserves structured data", () => {
  const user = { id: "u1", username: "alice", role: "USER" };
  setUser(user);
  assert.deepEqual(getUser(), user);
  removeUser();
  assert.equal(getUser(), null);
});

test("invalid stored user JSON returns null", () => {
  localStorage.setItem("user", "not-json");
  assert.equal(getUser(), null);
});

test("clearAuth removes token and user", () => {
  setToken("token");
  setUser({ id: "u1" });
  clearAuth();
  assert.equal(getToken(), null);
  assert.equal(getUser(), null);
});
