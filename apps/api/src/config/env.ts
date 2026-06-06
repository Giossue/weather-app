import { z } from "zod";
import { unitsSchema } from "@weather-app/contracts";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().url().default("postgresql://weather_app:weather_app@localhost:5432/weather_app"),
  OPENWEATHER_API_KEY: z.string().optional(),
  OPENWEATHER_BASE_URL: z.string().url().default("https://api.openweathermap.org"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  WEATHER_CACHE_TTL_SECONDS: z.coerce.number().int().min(30).max(86400).default(1800),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(1).default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(60),
  DEFAULT_LANGUAGE: z.string().default("es"),
  DEFAULT_UNITS: unitsSchema.default("metric")
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  NODE_ENV: Bun.env.NODE_ENV,
  PORT: Bun.env.PORT,
  DATABASE_URL: Bun.env.DATABASE_URL,
  OPENWEATHER_API_KEY: Bun.env.OPENWEATHER_API_KEY,
  OPENWEATHER_BASE_URL: Bun.env.OPENWEATHER_BASE_URL,
  CORS_ORIGIN: Bun.env.CORS_ORIGIN,
  WEATHER_CACHE_TTL_SECONDS: Bun.env.WEATHER_CACHE_TTL_SECONDS,
  RATE_LIMIT_WINDOW_SECONDS: Bun.env.RATE_LIMIT_WINDOW_SECONDS,
  RATE_LIMIT_MAX_REQUESTS: Bun.env.RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_LANGUAGE: Bun.env.DEFAULT_LANGUAGE,
  DEFAULT_UNITS: Bun.env.DEFAULT_UNITS
});
