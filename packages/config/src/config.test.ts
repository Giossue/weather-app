import { describe, expect, test } from "bun:test";
import { DEFAULT_LANGUAGE, OPENWEATHER_HOST } from "./index";

describe("config constants", () => {
  test("provides defaults", () => {
    expect(DEFAULT_LANGUAGE).toBe("es");
    expect(OPENWEATHER_HOST).toBe("api.openweathermap.org");
  });
});
