import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

// To do: review

const cwd = process.cwd();
const testFixturePath = join(cwd, "tests", "test-fixture-unused-export.js");

const runScript = () => {
  try {
    const output = execSync("node find-unimported-exports.js", {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    });

    return { output, exitCode: 0 };
  } catch (error) {
    return { output: error.stderr || error.stdout, exitCode: error.status };
  }
};

const removeFixture = () => {
  try {
    unlinkSync(testFixturePath);
  } catch {
    /* ignore if doesn't exist */
  }
};

const test = (name, fn) => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    process.exitCode = 1;
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

console.log("Testing find-unimported-exports.js\n");

test("should detect unimported export", () => {
  writeFileSync(testFixturePath, "export const UNUSED_TEST_EXPORT = 1;", "utf8");
  const { output, exitCode } = runScript();
  removeFixture();
  assert(exitCode === 1, `Expected exit code 1, got ${exitCode}`);
  assert(output.includes("UNUSED_TEST_EXPORT"), `Expected output to include "UNUSED_TEST_EXPORT", got: ${output}`);
  assert(output.includes("test-fixture-unused-export.js"), "Expected output to include fixture filename");
});

test("should pass when no unimported exports", () => {
  removeFixture();
  const { output, exitCode } = runScript();
  assert(exitCode === 0, `Expected exit code 0, got ${exitCode}`);
  assert(output.includes("No unimported exports found"), `Expected success message, got: ${output}`);
});

console.log("\nAll tests completed");
