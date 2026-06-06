import { Hono } from "hono";
import { createFavoriteLocationSchema, favoritesResponseSchema, reorderFavoritesSchema, uuidSchema } from "@weather-app/contracts";
import { parseWithSchema, requireDeviceToken } from "../../utils/validation";
import { favoritesService } from "./favorites.service";

export const favoritesRoutes = new Hono();

favoritesRoutes.get("/", async (c) => {
  const deviceToken = parseWithSchema(uuidSchema, requireDeviceToken(c.req.header("x-device-token")));
  const data = await favoritesService.list(deviceToken);
  return c.json(favoritesResponseSchema.parse({ data }));
});

favoritesRoutes.post("/", async (c) => {
  const deviceToken = parseWithSchema(uuidSchema, requireDeviceToken(c.req.header("x-device-token")));
  const body = await c.req.json().catch(() => ({}));
  const input = parseWithSchema(createFavoriteLocationSchema, body);
  const data = await favoritesService.create(deviceToken, input);
  return c.json({ data }, 201);
});

favoritesRoutes.delete("/:favoriteId", async (c) => {
  const deviceToken = parseWithSchema(uuidSchema, requireDeviceToken(c.req.header("x-device-token")));
  const favoriteId = parseWithSchema(uuidSchema, c.req.param("favoriteId"));
  await favoritesService.remove(deviceToken, favoriteId);
  return c.json({ ok: true });
});

favoritesRoutes.patch("/reorder", async (c) => {
  const deviceToken = parseWithSchema(uuidSchema, requireDeviceToken(c.req.header("x-device-token")));
  const body = await c.req.json().catch(() => ({}));
  const input = parseWithSchema(reorderFavoritesSchema, body);
  const data = await favoritesService.reorder(deviceToken, input.orderedIds);
  return c.json(favoritesResponseSchema.parse({ data }));
});
