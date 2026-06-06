import type { Units, WeatherCondition } from "@weather-app/contracts";
import { unixToIso } from "../../../utils/time";

type RawRecord = Record<string, any>;

export const asArray = <T>(value: T[] | T | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

export const numberValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const normalizeTemperature = (value: unknown, units: Units = "metric"): number | undefined => {
  const numeric = numberValue(value);
  if (numeric === undefined) return undefined;

  // Some One Call 4.0 timeline responses can arrive in Kelvin despite metric units.
  // Values above 170 are not plausible Celsius/Fahrenheit weather values, so treat them as Kelvin.
  if (units === "metric" && numeric > 170) return numeric - 273.15;
  if (units === "imperial" && numeric > 170) return ((numeric - 273.15) * 9) / 5 + 32;
  return numeric;
};

export const readUvIndex = (entry: RawRecord, preferMax = false): number | undefined => {
  const uv = entry.uv && typeof entry.uv === "object" ? entry.uv as RawRecord : undefined;
  const uvi = entry.uvi && typeof entry.uvi === "object" ? entry.uvi as RawRecord : undefined;

  const maxCandidates = [
    entry.uvi_max,
    entry.uv_index_max,
    entry.uvIndexMax,
    entry.max_uvi,
    entry.max_uv_index,
    uv?.max,
    uv?.maximum,
    uvi?.max,
    uvi?.maximum
  ];

  const directCandidates = [entry.uvi, entry.uv_index, entry.uvIndex, entry.uv, entry.ultravioletIndex];
  const candidates = preferMax ? [...maxCandidates, ...directCandidates] : [...directCandidates, ...maxCandidates];
  for (const candidate of candidates) {
    const value = numberValue(candidate);
    if (value !== undefined) return value;
  }
  return undefined;
};

export const firstDataEntry = (raw: RawRecord): RawRecord => {
  if (raw.current && typeof raw.current === "object") return raw.current;
  if (Array.isArray(raw.data) && raw.data[0] && typeof raw.data[0] === "object") return raw.data[0];
  return raw;
};

export const timelineEntries = (raw: RawRecord): RawRecord[] => {
  if (Array.isArray(raw.data)) return raw.data.filter((item) => item && typeof item === "object");
  if (Array.isArray(raw.list)) return raw.list.filter((item) => item && typeof item === "object");
  if (Array.isArray(raw.hourly)) return raw.hourly.filter((item) => item && typeof item === "object");
  if (Array.isArray(raw.daily)) return raw.daily.filter((item) => item && typeof item === "object");
  return [];
};

export const toIso = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  return unixToIso(value);
};

export const readCondition = (entry: RawRecord): WeatherCondition => {
  const rawWeather = Array.isArray(entry.weather) ? entry.weather[0] : entry.weather;
  if (rawWeather && typeof rawWeather === "object") {
    return {
      id: Number(rawWeather.id ?? 0),
      main: String(rawWeather.main ?? "Unknown"),
      description: String(rawWeather.description ?? "sin descripción"),
      icon: String(rawWeather.icon ?? "03d")
    };
  }

  return {
    id: Number(entry.weather_id ?? entry.id ?? 0),
    main: String(entry.weather_main ?? entry.main ?? "Unknown"),
    description: String(entry.weather_description ?? entry.description ?? "sin descripción"),
    icon: String(entry.weather_icon ?? entry.icon ?? "03d")
  };
};

export const readAlertIds = (entry: RawRecord): string[] => {
  const alertIds = entry.alert_ids ?? entry.alertIds ?? entry.alerts;
  return asArray(alertIds)
    .map((alert) => {
      if (typeof alert === "string" || typeof alert === "number") return String(alert);
      if (alert && typeof alert === "object") return String((alert as RawRecord).id ?? "");
      return "";
    })
    .filter(Boolean);
};

export const readPrecipitationAmount = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return undefined;
  const record = value as RawRecord;
  return numberValue(record["1h"] ?? record["1m"] ?? record["15m"] ?? record["1d"] ?? record.value ?? record.mm);
};

export const readTimezone = (raw: RawRecord) => ({
  timezone: typeof raw.timezone === "string" ? raw.timezone : undefined,
  timezoneOffsetSeconds: numberValue(raw.timezone_offset ?? raw.timezoneOffset)
});
