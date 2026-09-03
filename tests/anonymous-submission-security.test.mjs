import test from "node:test";
import assert from "node:assert/strict";

const MAX_BODY_BYTES = 16_384;

function requestFormat(contentType) {
  return contentType?.split(";", 1)[0].trim().toLowerCase() === "application/json";
}

function bodyWithinLimit(value) {
  return new TextEncoder().encode(value).byteLength <= MAX_BODY_BYTES;
}

test("anonymous submission accepts JSON content types with parameters", () => {
  assert.equal(requestFormat("application/json"), true);
  assert.equal(requestFormat("application/json; charset=utf-8"), true);
});

test("anonymous submission rejects non-JSON content types", () => {
  assert.equal(requestFormat("text/plain"), false);
  assert.equal(requestFormat("application/x-www-form-urlencoded"), false);
  assert.equal(requestFormat(undefined), false);
});

test("anonymous submission enforces the application-layer body size limit", () => {
  assert.equal(bodyWithinLimit("x".repeat(MAX_BODY_BYTES)), true);
  assert.equal(bodyWithinLimit("x".repeat(MAX_BODY_BYTES + 1)), false);
});
