import type { MiddlewareHandler } from "hono";
import { toErrorResponse } from "../shared/errors";

const shouldLog = () => Bun.env.NODE_ENV !== "test";

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const started = Date.now();
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;

  try {
    await next();
    if (!shouldLog()) return;

    const durationMs = Date.now() - started;
    const status = c.res.status;
    const level = status >= 400 ? "warn" : "info";

    console[level]("API request", {
      method,
      path,
      status,
      durationMs
    });
  } catch (error) {
    if (shouldLog()) {
      const durationMs = Date.now() - started;
      const response = toErrorResponse(error);
      console.error("API request error", {
        method,
        path,
        status: response.status,
        code: response.body.error.code,
        message: response.body.error.message,
        details: response.body.error.details,
        durationMs
      });
    }
    throw error;
  }
};
