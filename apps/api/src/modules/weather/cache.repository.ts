import { and, eq, gt, sql } from "drizzle-orm";
import type { WeatherEndpointType } from "@weather-app/contracts";
import { weatherApiRequestLogs, weatherCache } from "@weather-app/db";
import { db } from "../../db/client";

export type CacheHit<T> = {
  payload: T;
  expiresAt: Date;
};

export type CacheStore = {
  get<T>(cacheKey: string): Promise<CacheHit<T> | null>;
  set<T>(input: {
    cacheKey: string;
    endpointType: WeatherEndpointType;
    latitude?: number;
    longitude?: number;
    payload: T;
    expiresAt: Date;
  }): Promise<void>;
  log(input: { endpointType: WeatherEndpointType; statusCode: number; wasCached: boolean; durationMs: number }): Promise<void>;
};

export class PostgresCacheStore implements CacheStore {
  async get<T>(cacheKey: string): Promise<CacheHit<T> | null> {
    const rows = await db
      .select()
      .from(weatherCache)
      .where(and(eq(weatherCache.cacheKey, cacheKey), gt(weatherCache.expiresAt, new Date())))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return { payload: row.payload as T, expiresAt: row.expiresAt };
  }

  async set<T>(input: {
    cacheKey: string;
    endpointType: WeatherEndpointType;
    latitude?: number;
    longitude?: number;
    payload: T;
    expiresAt: Date;
  }): Promise<void> {
    await db
      .insert(weatherCache)
      .values({
        cacheKey: input.cacheKey,
        endpointType: input.endpointType,
        latitude: input.latitude,
        longitude: input.longitude,
        payload: input.payload,
        expiresAt: input.expiresAt,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: weatherCache.cacheKey,
        set: {
          payload: input.payload,
          expiresAt: input.expiresAt,
          updatedAt: sql`now()`
        }
      });
  }

  async log(input: { endpointType: WeatherEndpointType; statusCode: number; wasCached: boolean; durationMs: number }): Promise<void> {
    await db.insert(weatherApiRequestLogs).values(input);
  }
}

export class MemoryCacheStore implements CacheStore {
  private readonly items = new Map<string, CacheHit<unknown>>();
  readonly logs: Array<{ endpointType: WeatherEndpointType; statusCode: number; wasCached: boolean; durationMs: number }> = [];

  async get<T>(cacheKey: string): Promise<CacheHit<T> | null> {
    const item = this.items.get(cacheKey) as CacheHit<T> | undefined;
    if (!item || item.expiresAt <= new Date()) return null;
    return item;
  }

  async set<T>(input: { cacheKey: string; payload: T; expiresAt: Date }): Promise<void> {
    this.items.set(input.cacheKey, { payload: input.payload, expiresAt: input.expiresAt });
  }

  async log(input: { endpointType: WeatherEndpointType; statusCode: number; wasCached: boolean; durationMs: number }): Promise<void> {
    this.logs.push(input);
  }
}

export const createCacheKey = (endpointType: WeatherEndpointType, params: Record<string, unknown>) => {
  const stable = Object.entries(params)
    .filter(([key, value]) => key !== "refresh" && value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join("|");
  return `weather-v3|${endpointType}|${stable}`;
};
