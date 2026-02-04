import { getFormattedTime, getFormValidationErrors } from "#root/index.js";
import { test } from "node:test";
import assert from "node:assert";

test("timeDisplayer formats time correctly", () => {
  const result = getFormattedTime(new Date("2024-01-15T14:30:00"));
  assert.match(result, /\d{2}:\d{2}/);
});

test("getFormValidationErrors returns empty errors for valid form", () => {
  const validForm = {
    email: "test@example.com",
    name: "John Doe"
  };

  const result = getFormValidationErrors(validForm);
  assert.strictEqual(result.errors.length, 0);
  assert.strictEqual(result.message, "");
});

test("getFormValidationErrors detects empty field", () => {
  const invalidForm = {
    email: ""
  };

  const result = getFormValidationErrors(invalidForm);
  assert.strictEqual(result.errors.length, 1);
  assert.match(result.message, /please send a non empty value/);
});

test("getFormValidationErrors detects side whitespaces", () => {
  const invalidForm = {
    name: " John "
  };

  const result = getFormValidationErrors(invalidForm);
  assert.strictEqual(result.errors.length, 1);
  assert.match(result.message, /please remove side white-spaces/);
});
