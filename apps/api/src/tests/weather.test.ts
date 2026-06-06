import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { adaptCurrentWeather } from "../modules/weather/adapters/current-weather.adapter";
import { OpenWeatherClient, validateOpenWeatherPaginationUrl } from "../modules/weather/adapters/openweather-client";
import { MemoryCacheStore } from "../modules/weather/cache.repository";
import { WeatherService } from "../modules/weather/weather.service";
import { createRateLimiter } from "../middleware/rate-limit";
import { errorHandler, AppError } from "../shared/errors";

const sampleCurrentRaw = {
  timezone: "America/Guayaquil",
  timezone_offset: -18000,
  current: {
    dt: 1710000000,
    temp: 22.4,
    pressure: 1012,
    humidity: 78,
    weather: [{ id: 500, main: "Rain", description: "lluvia ligera", icon: "10d" }]
  }
};

describe("weather adapters", () => {
  test("normalizes current weather and absent optional fields", () => {
    const normalized = adaptCurrentWeather(sampleCurrentRaw);
    expect(normalized.temperature).toBe(22.4);
    expect(normalized.windGust).toBeUndefined();
    expect(normalized.condition.icon).toBe("10d");
  });
});

describe("weather cache", () => {
  test("returns active cache on second request", async () => {
    let calls = 0;
    const fakeClient = {
      getCurrent: async () => {
        calls += 1;
        return { payload: sampleCurrentRaw, status: 200, durationMs: 1 };
      }
    };
    const store = new MemoryCacheStore();
    const service = new WeatherService(fakeClient as any, store, 60);
    const query = { lat: -0.18, lon: -78.47, units: "metric" as const, lang: "es" };

    await service.current(query);
    const second = await service.current(query);

    expect(calls).toBe(1);
    expect(second.cache.wasCached).toBe(true);
  });

  test("refresh bypasses and replaces the active cache", async () => {
    let calls = 0;
    const fakeClient = {
      getCurrent: async () => {
        calls += 1;
        const payload = JSON.parse(JSON.stringify(sampleCurrentRaw));
        payload.current.temp = calls === 1 ? 22.4 : 24.4;
        return { payload, status: 200, durationMs: 1 };
      }
    };
    const store = new MemoryCacheStore();
    const service = new WeatherService(fakeClient as any, store, 60);
    const query = { lat: -0.18, lon: -78.47, units: "metric" as const, lang: "es" };

    await service.current(query);
    const refreshed = await service.current({ ...query, refresh: true });
    const cachedAfterRefresh = await service.current(query);

    expect(calls).toBe(2);
    expect(refreshed.cache.wasCached).toBe(false);
    expect(refreshed.data.temperature).toBe(24.4);
    expect(cachedAfterRefresh.cache.wasCached).toBe(true);
    expect(cachedAfterRefresh.data.temperature).toBe(24.4);
  });

  test("ignores expired cache", async () => {
    let calls = 0;
    const fakeClient = {
      getCurrent: async () => {
        calls += 1;
        return { payload: sampleCurrentRaw, status: 200, durationMs: 1 };
      }
    };
    const service = new WeatherService(fakeClient as any, new MemoryCacheStore(), -1);
    const query = { lat: -0.18, lon: -78.47, units: "metric" as const, lang: "es" };

    await service.current(query);
    await service.current(query);

    expect(calls).toBe(2);
  });

  test("passes external errors through", async () => {
    const fakeClient = {
      getCurrent: async () => {
        throw new AppError(503, "OPENWEATHER_ERROR", "Servicio externo no disponible");
      }
    };
    const service = new WeatherService(fakeClient as any, new MemoryCacheStore(), 60);
    await expect(service.current({ lat: 0, lon: 0, units: "metric", lang: "es" })).rejects.toThrow("Servicio externo");
  });
});

describe("openweather client", () => {
  test("validates safe pagination domain and path", () => {
    expect(() => validateOpenWeatherPaginationUrl("https://evil.test/data/4.0/onecall/timeline/1h", "https://api.openweathermap.org")).toThrow();
    expect(() => validateOpenWeatherPaginationUrl("https://api.openweathermap.org/not-allowed", "https://api.openweathermap.org")).toThrow();
    const safe = validateOpenWeatherPaginationUrl("https://api.openweathermap.org/data/4.0/onecall/timeline/1h?page=2", "https://api.openweathermap.org");
    expect(safe.hostname).toBe("api.openweathermap.org");
  });

  test("geocoding direct maps fetch response", async () => {
    const client = new OpenWeatherClient({
      apiKey: "test-key",
      baseUrl: "https://api.openweathermap.org",
      fetchImpl: async () => new Response(JSON.stringify([{ name: "Quito", lat: -0.18, lon: -78.47, country: "EC" }]), { status: 200 })
    });
    const response = await client.geocodeDirect({ q: "Quito", limit: 1 });
    expect(Array.isArray(response.payload)).toBe(true);
  });
});

describe("rate limiter", () => {
  test("limits repeated requests", async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.use("*", createRateLimiter({ windowSeconds: 60, maxRequests: 1 }));
    app.get("/", (c) => c.json({ ok: true }));

    const first = await app.request("/");
    const second = await app.request("/");

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
  });
});
