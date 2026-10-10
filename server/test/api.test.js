import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import app from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("health endpoint reports the service as ready", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", service: "pawfect-home-api" });
});

test("unknown API routes return a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/api/missing`);
  assert.equal(response.status, 404);
  assert.match((await response.json()).message, /No API route found/);
});

test("private routes require a session cookie", async () => {
  const response = await fetch(`${baseUrl}/api/requests/mine`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /sign in/i);
});

test("pet details require a session cookie", async () => {
  const response = await fetch(`${baseUrl}/api/pets/507f1f77bcf86cd799439011`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /sign in/i);
});

test("login reports missing credentials without touching the database", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /email and password/i);
});

test("API rejects unapproved browser origins", async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: "https://unapproved.example" },
  });
  assert.equal(response.status, 403);
  assert.match((await response.json()).message, /not allowed/i);
});
