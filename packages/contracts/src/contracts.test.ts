import { describe, expect, test } from "bun:test";
import { coordinatesQuerySchema, locationSearchQuerySchema } from "./index";

describe("contracts", () => {
  test("validates coordinate bounds", () => {
    expect(() => coordinatesQuerySchema.parse({ lat: 91, lon: 0 })).toThrow();
    expect(coordinatesQuerySchema.parse({ lat: "-0.18", lon: "-78.47" }).units).toBe("metric");
  });

  test("sanitizes location search whitespace", () => {
    expect(locationSearchQuerySchema.parse({ q: "  Quito   Ecuador  " }).q).toBe("Quito Ecuador");
  });
});
