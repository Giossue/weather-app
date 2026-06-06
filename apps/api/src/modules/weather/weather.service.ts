import type {
  CacheInfo,
  CurrentWeather,
  DailyForecast,
  MinuteForecast,
  TimelineForecast,
  Units,
  WeatherAlert,
  WeatherEndpointType,
  WeatherOverview
} from "@weather-app/contracts";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors";
import { adaptCurrentWeather } from "./adapters/current-weather.adapter";
import { adaptDailyTimeline } from "./adapters/daily-timeline.adapter";
import { adaptHourlyTimeline } from "./adapters/hourly-timeline.adapter";
import { adaptMinuteTimeline } from "./adapters/minute-timeline.adapter";
import { OpenWeatherClient } from "./adapters/openweather-client";
import { adaptQuarterHourTimeline } from "./adapters/quarter-hour-timeline.adapter";
import { adaptWeatherAlert, adaptWeatherAlertSummary } from "./adapters/weather-alert.adapter";
import { createCacheKey, type CacheStore, PostgresCacheStore } from "./cache.repository";

type WeatherQuery = {
  lat: number;
  lon: number;
  units: Units;
  lang: string;
  refresh?: boolean;
};

type CachedResponse<T> = {
  data: T;
  cache: CacheInfo;
};

export class WeatherService {
  constructor(
    private readonly client = new OpenWeatherClient({
      apiKey: env.OPENWEATHER_API_KEY,
      baseUrl: env.OPENWEATHER_BASE_URL
    }),
    private readonly cacheStore: CacheStore = new PostgresCacheStore(),
    private readonly ttlSeconds = env.WEATHER_CACHE_TTL_SECONDS
  ) {}

  async overview(query: WeatherQuery): Promise<WeatherOverview> {
    const [current, hourly, daily] = await Promise.all([
      this.current(query),
      this.hourly(query),
      this.daily(query)
    ]);

    const alertIds = Array.from(new Set([
      ...current.data.alertIds,
      ...hourly.data.flatMap((entry) => entry.alertIds),
      ...daily.data.flatMap((entry) => entry.alertIds)
    ])).slice(0, 5);

    return {
      current: current.data,
      hourly: hourly.data.slice(0, 24),
      daily: daily.data.slice(0, 14),
      alerts: alertIds.map((id) => adaptWeatherAlertSummary({ id })),
      cache: {
        wasCached: current.cache.wasCached && hourly.cache.wasCached && daily.cache.wasCached,
        generatedAt: new Date().toISOString()
      }
    };
  }

  current(query: WeatherQuery) {
    return this.withCache<CurrentWeather>("current", query, async () => {
      const result = await this.client.getCurrent(this.toOpenWeatherParams(query));
      return { payload: adaptCurrentWeather(result.payload as Record<string, any>, query.units), status: result.status, durationMs: result.durationMs };
    });
  }

  minutely(query: WeatherQuery) {
    return this.withCache<MinuteForecast[]>("minute", query, async () => {
      const result = await this.client.getMinuteTimeline(this.toOpenWeatherParams(query));
      return { payload: adaptMinuteTimeline(result.payload as Record<string, any>), status: result.status, durationMs: result.durationMs };
    });
  }

  quarterHourly(query: WeatherQuery) {
    return this.withCache<TimelineForecast[]>("quarter_hour", query, async () => {
      const result = await this.client.getQuarterHourTimeline(this.toOpenWeatherParams(query));
      return { payload: adaptQuarterHourTimeline(result.payload as Record<string, any>, query.units), status: result.status, durationMs: result.durationMs };
    });
  }

  hourly(query: WeatherQuery) {
    return this.withCache<TimelineForecast[]>("hourly", query, async () => {
      const result = await this.client.getHourlyTimeline(this.toOpenWeatherParams(query));
      return { payload: adaptHourlyTimeline(result.payload as Record<string, any>, query.units), status: result.status, durationMs: result.durationMs };
    });
  }

  daily(query: WeatherQuery) {
    return this.withCache<DailyForecast[]>("daily", query, async () => {
      const result = await this.client.getDailyTimeline(this.toOpenWeatherParams(query));
      return { payload: adaptDailyTimeline(result.payload as Record<string, any>, query.units), status: result.status, durationMs: result.durationMs };
    });
  }

  alert(alertId: string) {
    return this.withCache<WeatherAlert>("alert", { alertId }, async () => {
      const result = await this.client.getAlert(alertId);
      return { payload: adaptWeatherAlert(result.payload as Record<string, any>), status: result.status, durationMs: result.durationMs };
    });
  }

  private toOpenWeatherParams(query: WeatherQuery) {
    return {
      lat: query.lat,
      lon: query.lon,
      units: query.units,
      lang: query.lang
    };
  }

  private async withCache<T>(
    endpointType: WeatherEndpointType,
    params: Record<string, unknown>,
    loader: () => Promise<{ payload: T; status: number; durationMs: number }>
  ): Promise<CachedResponse<T>> {
    const cacheKey = createCacheKey(endpointType, params);

    if (!params.refresh) {
      const hit = await this.cacheStore.get<T>(cacheKey).catch(() => null);
      if (hit) {
        await this.cacheStore.log({ endpointType, statusCode: 200, wasCached: true, durationMs: 0 }).catch(() => undefined);
        return {
          data: hit.payload,
          cache: {
            wasCached: true,
            cacheKey,
            expiresAt: hit.expiresAt.toISOString(),
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    try {
      const result = await loader();
      const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);
      await this.cacheStore
        .set({
          cacheKey,
          endpointType,
          latitude: typeof params.lat === "number" ? params.lat : undefined,
          longitude: typeof params.lon === "number" ? params.lon : undefined,
          payload: result.payload,
          expiresAt
        })
        .catch(() => undefined);
      await this.cacheStore
        .log({ endpointType, statusCode: result.status, wasCached: false, durationMs: result.durationMs })
        .catch(() => undefined);

      return {
        data: result.payload,
        cache: {
          wasCached: false,
          cacheKey,
          expiresAt: expiresAt.toISOString(),
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500;
      await this.cacheStore.log({ endpointType, statusCode: status, wasCached: false, durationMs: 0 }).catch(() => undefined);
      throw error;
    }
  }
}

export const weatherService = new WeatherService();
