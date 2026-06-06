import { minuteForecastSchema, type MinuteForecast } from "@weather-app/contracts";
import { numberValue, readAlertIds, timelineEntries, toIso } from "./adapter-utils";

export const adaptMinuteTimeline = (raw: Record<string, any>): MinuteForecast[] =>
  timelineEntries(raw).map((entry) =>
    minuteForecastSchema.parse({
      time: toIso(entry.dt ?? entry.date ?? entry.time) ?? new Date().toISOString(),
      precipitationMmPerHour: numberValue(entry.precipitation ?? entry.precipitation_intensity ?? entry.rain) ?? 0,
      alertIds: readAlertIds(entry)
    })
  );
