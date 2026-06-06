import { Hono } from "hono";
import { locationReverseQuerySchema, locationSearchQuerySchema, locationsResponseSchema } from "@weather-app/contracts";
import { parseWithSchema } from "../../utils/validation";
import { locationsService } from "./locations.service";

export const locationsRoutes = new Hono();

locationsRoutes.get("/search", async (c) => {
  const query = parseWithSchema(locationSearchQuerySchema, c.req.query());
  const data = await locationsService.search(query.q, query.limit);
  return c.json(locationsResponseSchema.parse({ data }));
});

locationsRoutes.get("/reverse", async (c) => {
  const query = parseWithSchema(locationReverseQuerySchema, c.req.query());
  const data = await locationsService.reverse(query.lat, query.lon, query.limit);
  return c.json(locationsResponseSchema.parse({ data }));
});
