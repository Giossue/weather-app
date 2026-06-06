import { describe, expect, test } from "bun:test";
import { deviceProfiles, weatherCache } from "./schema";

describe("db schema", () => {
  test("exports required tables", () => {
    expect(deviceProfiles).toBeDefined();
    expect(weatherCache).toBeDefined();
  });
});
