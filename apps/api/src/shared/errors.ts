import type { Context, ErrorHandler } from "hono";
import { ZodError } from "zod";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, "BAD_REQUEST", message, details);

export const notFound = (message = "Recurso no encontrado") => new AppError(404, "NOT_FOUND", message);

export const externalServiceError = (status: number, message: string, details?: unknown) =>
  new AppError(status, "OPENWEATHER_ERROR", message, details);

export const missingApiKeyError = () =>
  new AppError(500, "OPENWEATHER_API_KEY_MISSING", "Falta configurar OPENWEATHER_API_KEY en el backend");

export const toErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          status: error.status,
          details: error.details
        }
      }
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Datos inválidos",
          status: 400,
          details: error.flatten()
        }
      }
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
        status: 500
      }
    }
  };
};

export const errorHandler: ErrorHandler = (error, c: Context) => {
  const response = toErrorResponse(error);
  if (response.status >= 500) {
    console.error("API error", { code: response.body.error.code, message: response.body.error.message });
  }
  return c.json(response.body, response.status as never);
};
