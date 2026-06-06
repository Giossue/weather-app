import { weatherAlertSchema, weatherAlertSummarySchema, type WeatherAlert, type WeatherAlertSummary } from "@weather-app/contracts";
import { toIso } from "./adapter-utils";

const preferredTextKeys = ["es", "description", "text", "message", "headline", "instruction", "event", "en", "value"];

const readableText = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text && text !== "[object Object]" ? text : undefined;
  }
  if (Array.isArray(value)) {
    const parts = value.map(readableText).filter((part): part is string => Boolean(part));
    return parts.length > 0 ? parts.join("\n\n") : undefined;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of preferredTextKeys) {
      const text = readableText(record[key]);
      if (text) return text;
    }

    const parts = Object.entries(record)
      .map(([key, entryValue]) => {
        const text = readableText(entryValue);
        return text ? `${key}: ${text}` : undefined;
      })
      .filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join("\n") : undefined;
  }
  return undefined;
};

export const adaptWeatherAlertSummary = (raw: Record<string, any>): WeatherAlertSummary =>
  weatherAlertSummarySchema.parse({
    id: String(raw.id ?? raw.alert_id ?? raw.event ?? crypto.randomUUID()),
    event: readableText(raw.event) ?? readableText(raw.headline),
    source: readableText(raw.sender_name) ?? readableText(raw.source),
    startsAt: toIso(raw.start ?? raw.starts_at),
    endsAt: toIso(raw.end ?? raw.ends_at)
  });

export const adaptWeatherAlert = (raw: Record<string, any>): WeatherAlert =>
  weatherAlertSchema.parse({
    ...adaptWeatherAlertSummary(raw),
    description: readableText(raw.description ?? raw.body ?? raw.details ?? raw.instruction)
  });
