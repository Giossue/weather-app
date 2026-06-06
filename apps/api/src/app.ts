import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env";
import { createRateLimiter } from "./middleware/rate-limit";
import { requestLogger } from "./middleware/request-logger";
import { favoritesRoutes } from "./modules/favorites/favorites.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { locationsRoutes } from "./modules/locations/locations.routes";
import { preferencesRoutes } from "./modules/preferences/preferences.routes";
import { weatherRoutes } from "./modules/weather/weather.routes";
import { errorHandler } from "./shared/errors";

export const createApp = () => {
  const app = new Hono();

  app.onError(errorHandler);

  app.use("*", requestLogger);

  app.use(
    "*",
    cors({
      origin: env.CORS_ORIGIN,
      allowHeaders: ["Content-Type", "Authorization", "x-device-token"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true
    })
  );

  app.use(
    "/api/*",
    createRateLimiter({
      windowSeconds: env.RATE_LIMIT_WINDOW_SECONDS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS
    })
  );

  app.route("/health", healthRoutes);
  app.route("/api/weather", weatherRoutes);
  app.route("/api/locations", locationsRoutes);
  app.route("/api/favorites", favoritesRoutes);
  app.route("/api/preferences", preferencesRoutes);

  app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Ruta no encontrada", status: 404 } }, 404));

  return app;
};

export const app = createApp();
