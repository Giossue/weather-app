import type { WeatherEndpointType } from "@weather-app/contracts";
import { OPENWEATHER_HOST } from "@weather-app/config";
import { AppError, externalServiceError, missingApiKeyError } from "../../../shared/errors";

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type OpenWeatherClientOptions = {
  apiKey?: string;
  baseUrl: string;
  timeoutMs?: number;
  fetchImpl?: FetchLike;
  maxPages?: number;
};

type RequestParams = Record<string, string | number | boolean | undefined>;

export type OpenWeatherRequestResult<T = unknown> = {
  payload: T;
  status: number;
  durationMs: number;
};

const isOneCallEndpoint = (endpointType: WeatherEndpointType) =>
  !endpointType.startsWith("geocoding_");

const getOpenWeatherText = (payload: unknown, key: "cod" | "message") => {
  if (!payload || typeof payload !== "object" || !(key in payload)) return undefined;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
};

export const validateOpenWeatherPaginationUrl = (href: string, baseUrl: string) => {
  const parsed = new URL(href, baseUrl);
  const expectedHost = new URL(baseUrl).host || OPENWEATHER_HOST;
  if (parsed.host !== expectedHost || parsed.hostname !== OPENWEATHER_HOST) {
    throw new AppError(502, "UNSAFE_PAGINATION_URL", "OpenWeather devolvió un enlace de paginación no permitido");
  }
  if (!parsed.pathname.startsWith("/data/4.0/") && !parsed.pathname.startsWith("/geo/1.0/")) {
    throw new AppError(502, "UNSAFE_PAGINATION_PATH", "OpenWeather devolvió una ruta de paginación no permitida");
  }
  return parsed;
};

export class OpenWeatherClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;
  private readonly maxPages: number;

  constructor(options: OpenWeatherClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxPages = options.maxPages ?? 4;
  }

  getCurrent(params: RequestParams) {
    return this.request("current", "/data/4.0/onecall/current", params);
  }

  getMinuteTimeline(params: RequestParams) {
    return this.requestPaginated("minute", "/data/4.0/onecall/timeline/1min", params);
  }

  getQuarterHourTimeline(params: RequestParams) {
    return this.requestPaginated("quarter_hour", "/data/4.0/onecall/timeline/15min", params);
  }

  getHourlyTimeline(params: RequestParams) {
    return this.requestPaginated("hourly", "/data/4.0/onecall/timeline/1h", params);
  }

  getDailyTimeline(params: RequestParams) {
    return this.requestPaginated("daily", "/data/4.0/onecall/timeline/1day", params);
  }

  getAlert(alertId: string) {
    return this.request("alert", `/data/4.0/onecall/alert/${encodeURIComponent(alertId)}`, {});
  }

  geocodeDirect(params: RequestParams) {
    return this.request("geocoding_direct", "/geo/1.0/direct", params);
  }

  geocodeReverse(params: RequestParams) {
    return this.request("geocoding_reverse", "/geo/1.0/reverse", params);
  }

  private buildUrl(path: string, params: RequestParams) {
    const placeholderKeys = new Set(["PEGAR_AQUI_LA_CLAVE", "replace-with-your-openweather-key", "tu-clave-real"]);
    if (!this.apiKey || placeholderKeys.has(this.apiKey)) throw missingApiKeyError();
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    url.searchParams.set("appid", this.apiKey);
    return url;
  }

  private async request<T = unknown>(endpointType: WeatherEndpointType, path: string, params: RequestParams): Promise<OpenWeatherRequestResult<T>> {
    const url = this.buildUrl(path, params);
    return this.fetchJson<T>(endpointType, url);
  }

  private async requestPaginated<T = unknown>(endpointType: WeatherEndpointType, path: string, params: RequestParams): Promise<OpenWeatherRequestResult<T>> {
    const firstUrl = this.buildUrl(path, params);
    const started = Date.now();
    const pages: unknown[] = [];
    const visited = new Set<string>();
    let nextUrl: URL | undefined = firstUrl;
    let status = 200;

    for (let page = 0; page < this.maxPages && nextUrl; page += 1) {
      const normalized = nextUrl.toString();
      if (visited.has(normalized)) break;
      visited.add(normalized);

      const result: OpenWeatherRequestResult<Record<string, unknown>> = await this.fetchJson<Record<string, unknown>>(endpointType, nextUrl);
      status = result.status;
      const payload: Record<string, unknown> = result.payload;
      pages.push(payload);

      const next: string | undefined = typeof payload["next"] === "string" ? payload["next"] : undefined;
      nextUrl = next ? validateOpenWeatherPaginationUrl(next, this.baseUrl) : undefined;
      if (nextUrl && !nextUrl.searchParams.has("appid") && this.apiKey) {
        nextUrl.searchParams.set("appid", this.apiKey);
      }
    }

    if (pages.length === 1) {
      return { payload: pages[0] as T, status, durationMs: Date.now() - started };
    }

    const data = pages.flatMap((page) => {
      if (page && typeof page === "object" && Array.isArray((page as Record<string, unknown>).data)) {
        return (page as Record<string, unknown>).data as unknown[];
      }
      return [];
    });

    return { payload: { data } as T, status, durationMs: Date.now() - started };
  }

  private async fetchJson<T>(endpointType: WeatherEndpointType, url: URL): Promise<OpenWeatherRequestResult<T>> {
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, { signal: controller.signal });
      const durationMs = Date.now() - started;
      const text = await response.text();
      const payload = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const openWeatherCode = getOpenWeatherText(payload, "cod");
        const openWeatherMessage = getOpenWeatherText(payload, "message");
        const message = response.status === 401 && isOneCallEndpoint(endpointType)
          ? "La API key responde, pero no tiene permisos para OpenWeather One Call API 4.0. Activa One Call API 4.0 en OpenWeather o usa una clave con esa suscripción."
          : response.status === 401
            ? "Clave de OpenWeather inválida o sin permisos"
            : response.status === 429
              ? "OpenWeather limitó temporalmente las solicitudes"
              : response.status >= 500
                ? "OpenWeather no está disponible temporalmente"
                : "OpenWeather rechazó la solicitud";

        throw externalServiceError(response.status, message, {
          endpointType,
          status: response.status,
          openWeatherCode,
          openWeatherMessage,
          path: url.pathname
        });
      }

      return { payload: payload as T, status: response.status, durationMs };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw externalServiceError(504, "OpenWeather tardó demasiado en responder", { endpointType, path: url.pathname });
      }
      throw externalServiceError(502, "No se pudo conectar con OpenWeather", { endpointType, path: url.pathname });
    } finally {
      clearTimeout(timeout);
    }
  }
}
