import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const extract = readFileSync(
  resolve(__dirname, "..", "..", "routes/api.ia.saudejusia.extract.ts"),
  "utf8",
);

describe("saudejusia extract: upstream 402 handling (static)", () => {
  it("short-circuits AI_PAYMENT_REQUIRED as 503 before retry bookkeeping and 422", () => {
    const pay = extract.indexOf('msg === "AI_PAYMENT_REQUIRED"');
    const retry = extract.indexOf("retriesUsed = i + 1;\n            console.error");
    const v422 = extract.indexOf('"validation_failed"');
    expect(pay).toBeGreaterThan(-1);
    expect(pay).toBeLessThan(retry);
    expect(pay).toBeLessThan(v422);
    const block = extract.slice(pay, pay + 300);
    expect(block).toContain("503");
    expect(block).not.toMatch(/console\.|stack|e\.message/);
  });
});
