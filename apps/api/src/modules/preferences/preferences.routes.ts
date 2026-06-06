import { Hono } from "hono";
import { preferencesResponseSchema, updateUserPreferencesSchema, uuidSchema } from "@weather-app/contracts";
import { parseWithSchema, requireDeviceToken } from "../../utils/validation";
import { preferencesService } from "./preferences.service";

export const preferencesRoutes = new Hono();

preferencesRoutes.get("/", async (c) => {
  const deviceToken = parseWithSchema(uuidSchema, requireDeviceToken(c.req.header("x-device-token")));
  const data = await preferencesService.get(deviceToken);
  return c.json(preferencesResponseSchema.parse({ data }));
});

preferencesRoutes.put("/", async (c) => {
  const deviceToken = parseWithSchema(uuidSchema, requireDeviceToken(c.req.header("x-device-token")));
  const body = await c.req.json().catch(() => ({}));
  const input = parseWithSchema(updateUserPreferencesSchema, body);
  const data = await preferencesService.update(deviceToken, input);
  return c.json(preferencesResponseSchema.parse({ data }));
});
