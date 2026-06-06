import { Hono } from "hono";
import { z } from "zod";
import {
  coordinatesQuerySchema,
  currentWeatherResponseSchema,
  dailyForecastSchema,
  minuteForecastSchema,
  timelineForecastSchema,
  weatherAlertSchema,
  weatherCollectionResponseSchema,
  weatherOverviewSchema
} from "@weather-app/contracts";
import { parseWithSchema } from "../../utils/validation";
import { weatherService } from "./weather.service";

export const weatherRoutes = new Hono();

weatherRoutes.get("/overview", async (c) => {
  const query = parseWithSchema(coordinatesQuerySchema, c.req.query());
  const data = await weatherService.overview(query);
  return c.json(weatherOverviewSchema.parse(data));
});

weatherRoutes.get("/current", async (c) => {
  const query = parseWithSchema(coordinatesQuerySchema, c.req.query());
  const data = await weatherService.current(query);
  return c.json(currentWeatherResponseSchema.parse(data));
});

weatherRoutes.get("/minutely", async (c) => {
  const query = parseWithSchema(coordinatesQuerySchema, c.req.query());
  const data = await weatherService.minutely(query);
  return c.json(weatherCollectionResponseSchema(minuteForecastSchema).parse(data));
});

weatherRoutes.get("/quarter-hourly", async (c) => {
  const query = parseWithSchema(coordinatesQuerySchema, c.req.query());
  const data = await weatherService.quarterHourly(query);
  return c.json(weatherCollectionResponseSchema(timelineForecastSchema).parse(data));
});

weatherRoutes.get("/hourly", async (c) => {
  const query = parseWithSchema(coordinatesQuerySchema, c.req.query());
  const data = await weatherService.hourly(query);
  return c.json(weatherCollectionResponseSchema(timelineForecastSchema).parse(data));
});

weatherRoutes.get("/daily", async (c) => {
  const query = parseWithSchema(coordinatesQuerySchema, c.req.query());
  const data = await weatherService.daily(query);
  return c.json(weatherCollectionResponseSchema(dailyForecastSchema).parse(data));
});

weatherRoutes.get("/alerts/:alertId", async (c) => {
  const { alertId } = parseWithSchema(z.object({ alertId: z.string().trim().min(1).max(160) }), c.req.param());
  const data = await weatherService.alert(alertId);
  return c.json({ data: weatherAlertSchema.parse(data.data), cache: data.cache });
});
