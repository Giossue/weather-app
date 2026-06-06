import type { LocationResult } from "@weather-app/contracts";
import { env } from "../../config/env";
import { OpenWeatherClient } from "../weather/adapters/openweather-client";
import { createCacheKey, type CacheStore, PostgresCacheStore } from "../weather/cache.repository";

type RawLocation = {
  name?: string;
  local_names?: Record<string, string>;
  lat?: number;
  lon?: number;
  country?: string;
  state?: string;
};

const adaptLocation = (raw: RawLocation): LocationResult => ({
  name: String(raw.name ?? "Ubicación"),
  localNames: raw.local_names,
  state: raw.state,
  country: String(raw.country ?? ""),
  latitude: Number(raw.lat),
  longitude: Number(raw.lon)
});

export class LocationsService {
  constructor(
    private readonly client = new OpenWeatherClient({
      apiKey: env.OPENWEATHER_API_KEY,
      baseUrl: env.OPENWEATHER_BASE_URL
    }),
    private readonly cacheStore: CacheStore = new PostgresCacheStore(),
    private readonly ttlSeconds = env.WEATHER_CACHE_TTL_SECONDS
  ) {}

  async search(q: string, limit: number): Promise<LocationResult[]> {
    return this.cachedLocations("geocoding_direct", { q, limit }, async () => {
      const result = await this.client.geocodeDirect({ q, limit });
      return Array.isArray(result.payload) ? result.payload.map((item) => adaptLocation(item as RawLocation)) : [];
    });
  }

  async reverse(lat: number, lon: number, limit: number): Promise<LocationResult[]> {
    return this.cachedLocations("geocoding_reverse", { lat, lon, limit }, async () => {
      const result = await this.client.geocodeReverse({ lat, lon, limit });
      return Array.isArray(result.payload) ? result.payload.map((item) => adaptLocation(item as RawLocation)) : [];
    });
  }

  private async cachedLocations(type: "geocoding_direct" | "geocoding_reverse", params: Record<string, unknown>, loader: () => Promise<LocationResult[]>) {
    const cacheKey = createCacheKey(type, params);
    const hit = await this.cacheStore.get<LocationResult[]>(cacheKey).catch(() => null);
    if (hit) return hit.payload;
    const payload = await loader();
    await this.cacheStore
      .set({
        cacheKey,
        endpointType: type,
        latitude: typeof params.lat === "number" ? params.lat : undefined,
        longitude: typeof params.lon === "number" ? params.lon : undefined,
        payload,
        expiresAt: new Date(Date.now() + this.ttlSeconds * 1000)
      })
      .catch(() => undefined);
    return payload;
  }
}

export const locationsService = new LocationsService();
