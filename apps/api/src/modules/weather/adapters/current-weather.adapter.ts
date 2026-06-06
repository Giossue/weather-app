import { currentWeatherSchema, type CurrentWeather, type Units } from "@weather-app/contracts";
import { firstDataEntry, normalizeTemperature, numberValue, readAlertIds, readCondition, readPrecipitationAmount, readTimezone, readUvIndex, toIso } from "./adapter-utils";

export const adaptCurrentWeather = (raw: Record<string, any>, units: Units = "metric"): CurrentWeather => {
  const entry = firstDataEntry(raw);
  const timezone = readTimezone(raw);

  return currentWeatherSchema.parse({
    recordedAt: toIso(entry.dt ?? entry.date ?? entry.time) ?? new Date().toISOString(),
    timezone: timezone.timezone,
    timezoneOffsetSeconds: timezone.timezoneOffsetSeconds,
    sunrise: toIso(entry.sunrise),
    sunset: toIso(entry.sunset),
    temperature: normalizeTemperature(entry.temp ?? entry.temperature, units) ?? 0,
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
    rainLastHour: readPrecipitationAmount(entry.rain),
    snowLastHour: readPrecipitationAmount(entry.snow),
    condition: readCondition(entry),
    alertIds: readAlertIds(entry)
  });
};
