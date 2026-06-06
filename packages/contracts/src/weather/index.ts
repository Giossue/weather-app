import { z } from "zod";
import { cacheInfoSchema } from "../common";

export const weatherEndpointTypeSchema = z.enum([
  "current",
  "minute",
  "quarter_hour",
  "hourly",
  "daily",
  "alert",
  "geocoding_direct",
  "geocoding_reverse"
]);
export type WeatherEndpointType = z.infer<typeof weatherEndpointTypeSchema>;

export const weatherConditionSchema = z.object({
  id: z.number().int(),
  main: z.string(),
  description: z.string(),
  icon: z.string()
});
export type WeatherCondition = z.infer<typeof weatherConditionSchema>;

export const precipitationSchema = z.object({
  rainMm: z.number().optional(),
  snowMm: z.number().optional()
});
export type Precipitation = z.infer<typeof precipitationSchema>;

export const currentWeatherSchema = z.object({
  recordedAt: z.string().datetime(),
  timezone: z.string().optional(),
  timezoneOffsetSeconds: z.number().optional(),
  sunrise: z.string().datetime().optional(),
  sunset: z.string().datetime().optional(),
  temperature: z.number(),
  feelsLike: z.number().optional(),
  pressure: z.number().optional(),
  humidity: z.number().optional(),
  dewPoint: z.number().optional(),
  uvi: z.number().optional(),
  clouds: z.number().optional(),
  visibility: z.number().optional(),
  windSpeed: z.number().optional(),
  windDeg: z.number().optional(),
  windGust: z.number().optional(),
  rainLastHour: z.number().optional(),
  snowLastHour: z.number().optional(),
  condition: weatherConditionSchema,
  alertIds: z.array(z.string()).default([])
});
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;

export const minuteForecastSchema = z.object({
  time: z.string().datetime(),
  precipitationMmPerHour: z.number().default(0),
  alertIds: z.array(z.string()).default([])
});
export type MinuteForecast = z.infer<typeof minuteForecastSchema>;

export const timelineForecastSchema = z.object({
  time: z.string().datetime(),
  temperature: z.number().optional(),
  feelsLike: z.number().optional(),
  pressure: z.number().optional(),
  humidity: z.number().optional(),
  dewPoint: z.number().optional(),
  uvi: z.number().optional(),
  clouds: z.number().optional(),
  visibility: z.number().optional(),
  windSpeed: z.number().optional(),
  windDeg: z.number().optional(),
  windGust: z.number().optional(),
  probabilityOfPrecipitation: z.number().optional(),
  rain: precipitationSchema.optional(),
  snow: precipitationSchema.optional(),
  condition: weatherConditionSchema.optional(),
  alertIds: z.array(z.string()).default([])
});
export type TimelineForecast = z.infer<typeof timelineForecastSchema>;

export const dailyTemperatureSchema = z.object({
  day: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  night: z.number().optional(),
  evening: z.number().optional(),
  morning: z.number().optional()
});
export type DailyTemperature = z.infer<typeof dailyTemperatureSchema>;

export const dailyFeelsLikeSchema = z.object({
  day: z.number().optional(),
  night: z.number().optional(),
  evening: z.number().optional(),
  morning: z.number().optional()
});
export type DailyFeelsLike = z.infer<typeof dailyFeelsLikeSchema>;

export const dailyForecastSchema = z.object({
  date: z.string().datetime(),
  sunrise: z.string().datetime().optional(),
  sunset: z.string().datetime().optional(),
  moonrise: z.string().datetime().optional(),
  moonset: z.string().datetime().optional(),
  moonPhase: z.number().optional(),
  temperature: dailyTemperatureSchema,
  feelsLike: dailyFeelsLikeSchema.optional(),
  pressure: z.number().optional(),
  humidity: z.number().optional(),
  dewPoint: z.number().optional(),
  windSpeed: z.number().optional(),
  windDeg: z.number().optional(),
  windGust: z.number().optional(),
  condition: weatherConditionSchema.optional(),
  clouds: z.number().optional(),
  probabilityOfPrecipitation: z.number().optional(),
  uvi: z.number().optional(),
  rain: z.number().optional(),
  snow: z.number().optional(),
  alertIds: z.array(z.string()).default([])
});
export type DailyForecast = z.infer<typeof dailyForecastSchema>;

export const weatherAlertSummarySchema = z.object({
  id: z.string(),
  event: z.string().optional(),
  source: z.string().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional()
});
export type WeatherAlertSummary = z.infer<typeof weatherAlertSummarySchema>;

export const weatherAlertSchema = weatherAlertSummarySchema.extend({
  description: z.string().optional()
});
export type WeatherAlert = z.infer<typeof weatherAlertSchema>;

export const weatherLocationContextSchema = z.object({
  name: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number(),
  longitude: z.number()
});
export type WeatherLocationContext = z.infer<typeof weatherLocationContextSchema>;

export const weatherOverviewSchema = z.object({
  location: weatherLocationContextSchema.optional(),
  current: currentWeatherSchema,
  hourly: z.array(timelineForecastSchema),
  daily: z.array(dailyForecastSchema),
  alerts: z.array(weatherAlertSummarySchema).default([]),
  cache: cacheInfoSchema
});
export type WeatherOverview = z.infer<typeof weatherOverviewSchema>;

export const weatherCollectionResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  data: z.array(itemSchema),
  cache: cacheInfoSchema
});

export const currentWeatherResponseSchema = z.object({
  data: currentWeatherSchema,
  cache: cacheInfoSchema
});
export type CurrentWeatherResponse = z.infer<typeof currentWeatherResponseSchema>;
