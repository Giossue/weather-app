import { dailyForecastSchema, type DailyForecast, type Units } from "@weather-app/contracts";
import { normalizeTemperature, numberValue, readAlertIds, readCondition, readPrecipitationAmount, readUvIndex, timelineEntries, toIso } from "./adapter-utils";

export const adaptDailyTimeline = (raw: Record<string, any>, units: Units = "metric"): DailyForecast[] =>
  timelineEntries(raw).map((entry) => {
    const temp = entry.temp && typeof entry.temp === "object" ? entry.temp : entry.temperature ?? {};
    const feels = entry.feels_like && typeof entry.feels_like === "object" ? entry.feels_like : entry.feelsLike;

    return dailyForecastSchema.parse({
      date: toIso(entry.dt ?? entry.date ?? entry.time) ?? new Date().toISOString(),
      sunrise: toIso(entry.sunrise),
      sunset: toIso(entry.sunset),
      moonrise: toIso(entry.moonrise),
      moonset: toIso(entry.moonset),
      moonPhase: numberValue(entry.moon_phase ?? entry.moonPhase),
      temperature: {
        day: normalizeTemperature(temp.day ?? entry.temp_day, units),
        min: normalizeTemperature(temp.min ?? entry.temp_min, units),
        max: normalizeTemperature(temp.max ?? entry.temp_max, units),
        night: normalizeTemperature(temp.night ?? entry.temp_night, units),
        evening: normalizeTemperature(temp.eve ?? temp.evening ?? entry.temp_evening, units),
        morning: normalizeTemperature(temp.morn ?? temp.morning ?? entry.temp_morning, units)
      },
      feelsLike: feels && typeof feels === "object" ? {
        day: normalizeTemperature(feels.day, units),
        night: normalizeTemperature(feels.night, units),
        evening: normalizeTemperature(feels.eve ?? feels.evening, units),
        morning: normalizeTemperature(feels.morn ?? feels.morning, units)
      } : undefined,
      pressure: numberValue(entry.pressure),
      humidity: numberValue(entry.humidity),
      dewPoint: normalizeTemperature(entry.dew_point ?? entry.dewPoint, units),
      windSpeed: numberValue(entry.wind_speed ?? entry.windSpeed),
      windDeg: numberValue(entry.wind_deg ?? entry.windDeg),
      windGust: numberValue(entry.wind_gust ?? entry.windGust),
      condition: readCondition(entry),
      clouds: numberValue(entry.clouds),
      probabilityOfPrecipitation: numberValue(entry.pop ?? entry.probability_of_precipitation),
      uvi: readUvIndex(entry, true),
      rain: readPrecipitationAmount(entry.rain),
      snow: readPrecipitationAmount(entry.snow),
      alertIds: readAlertIds(entry)
    });
  });
