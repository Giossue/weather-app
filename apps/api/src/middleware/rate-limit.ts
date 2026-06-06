import type { MiddlewareHandler } from "hono";
import { AppError } from "../shared/errors";

type Bucket = {
  resetAt: number;
  count: number;
};

export type RateLimitOptions = {
  windowSeconds: number;
  maxRequests: number;
};

export const createRateLimiter = (options: RateLimitOptions): MiddlewareHandler => {
  const buckets = new Map<string, Bucket>();
  const windowMs = options.windowSeconds * 1000;

  return async (c, next) => {
    const forwardedFor = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    const key = forwardedFor || c.req.header("x-real-ip") || "local";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (bucket.count >= options.maxRequests) {
      throw new AppError(429, "RATE_LIMITED", "Demasiadas solicitudes. Intenta nuevamente en unos segundos.");
    }

    bucket.count += 1;
    await next();
  };
};
