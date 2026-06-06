import { describe, expect, test } from "bun:test";
import { createApp } from "../app";

describe("api app", () => {
  test("health endpoint responds", async () => {
    const app = createApp();
    const response = await app.request("/health");
    expect(response.status).toBe(200);
  });

  test("validates coordinate bounds before external calls", async () => {
    const app = createApp();
    const response = await app.request("/api/weather/current?lat=91&lon=0");
    expect(response.status).toBe(400);
  });
});
