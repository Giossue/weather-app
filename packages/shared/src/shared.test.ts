import { describe, expect, test } from "bun:test";
import { clamp, roundTo } from "./index";

describe("shared utils", () => {
  test("clamps values", () => {
    expect(clamp(12, 0, 10)).toBe(10);
  });

  test("rounds decimals", () => {
    expect(roundTo(12.345, 1)).toBe(12.3);
  });
});
