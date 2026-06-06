import type { z } from "zod";
import { badRequest } from "../shared/errors";

export const parseWithSchema = <T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> => {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw badRequest("Datos inválidos", result.error.flatten());
  }
  return result.data;
};

export const requireDeviceToken = (value: string | undefined) => {
  if (!value) throw badRequest("Falta el header x-device-token");
  return value;
};
