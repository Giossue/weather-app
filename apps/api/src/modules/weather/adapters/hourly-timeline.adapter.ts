import { timelineForecastSchema, type TimelineForecast, type Units } from "@weather-app/contracts";
import { normalizeTemperature, numberValue, readAlertIds, readCondition, readPrecipitationAmount, readUvIndex, timelineEntries, toIso } from "./adapter-utils";

const adaptTimelineEntry = (entry: Record<string, any>, units: Units): TimelineForecast =>
  timelineForecastSchema.parse({
    time: toIso(entry.dt ?? entry.date ?? entry.time) ?? new Date().toISOString(),
    temperature: normalizeTemperature(entry.temp ?? entry.temperature, units),
    feelsLike: normalizeTemperature(entry.feels_like ?? entry.feelsLike, units),
    pressure: numberValue(entry.pressure),
    humidity: numberValue(entry.humidity),
    dewPoint: normalizeTemperature(entry.dew_point ?? entry.dewPoint, units),
    uvi: readUvIndex(entry),
    clouds: numberValue(entry.clouds),
    visibility: numberValue(entry.visibility),
    windSpeed: numberValue(entry.wind_speed ?? entry.windSpeed),
    windDeg: numberValue(entry.wind_deg ?? entry.windDeg),
    windGust: numberValue(entry.wind_gust ?? entry.windGust),
    probabilityOfPrecipitation: numberValue(entry.pop ?? entry.probability_of_precipitation),
    rain: readPrecipitationAmount(entry.rain) !== undefined ? { rainMm: readPrecipitationAmount(entry.rain) } : undefined,
    snow: readPrecipitationAmount(entry.snow) !== undefined ? { snowMm: readPrecipitationAmount(entry.snow) } : undefined,
    condition: readCondition(entry),
    alertIds: readAlertIds(entry)
  });

export const adaptHourlyTimeline = (raw: Record<string, any>, units: Units = "metric"): TimelineForecast[] => timelineEntries(raw).map((entry) => adaptTimelineEntry(entry, units));

export const adaptQuarterHourTimeline = adaptHourlyTimeline;
