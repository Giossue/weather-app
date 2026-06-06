import { z } from "zod";

export const unitsSchema = z.enum(["metric", "imperial", "standard"]);
export type Units = z.infer<typeof unitsSchema>;

export const themeSchema = z.enum(["light", "dark", "system"]);
export type ThemePreference = z.infer<typeof themeSchema>;

export const defaultLocationModeSchema = z.enum(["geolocation", "favorite"]);
export type DefaultLocationMode = z.infer<typeof defaultLocationModeSchema>;

export const languageSchema = z
  .string()
  .trim()
  .min(2)
  .max(8)
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Idioma inválido");
export type LanguageCode = z.infer<typeof languageSchema>;

export const latitudeSchema = z.coerce.number().min(-90).max(90);
export const longitudeSchema = z.coerce.number().min(-180).max(180);

export const uuidSchema = z.string().uuid();

export const booleanQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return false;
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return value;
}, z.boolean());

export const coordinatesQuerySchema = z.object({
  lat: latitudeSchema,
  lon: longitudeSchema,
  units: unitsSchema.default("metric"),
  lang: languageSchema.default("es"),
  refresh: booleanQuerySchema.default(false)
});

export const cacheInfoSchema = z.object({
  wasCached: z.boolean(),
  cacheKey: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  generatedAt: z.string().datetime()
});
export type CacheInfo = z.infer<typeof cacheInfoSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    status: z.number().int(),
    details: z.unknown().optional()
  })
});
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;

export const deviceTokenHeaderSchema = z.object({
  "x-device-token": uuidSchema
});
