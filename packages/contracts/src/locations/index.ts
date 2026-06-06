import { z } from "zod";
import { latitudeSchema, longitudeSchema } from "../common";

export const locationSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(100).transform((value) => value.replace(/\s+/g, " ")),
  limit: z.coerce.number().int().min(1).max(5).default(5)
});

export const locationReverseQuerySchema = z.object({
  lat: latitudeSchema,
  lon: longitudeSchema,
  limit: z.coerce.number().int().min(1).max(5).default(1)
});

export const locationSchema = z.object({
  name: z.string(),
  localNames: z.record(z.string(), z.string()).optional(),
  state: z.string().optional(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number()
});
export type LocationResult = z.infer<typeof locationSchema>;

export const locationsResponseSchema = z.object({
  data: z.array(locationSchema)
});
export type LocationsResponse = z.infer<typeof locationsResponseSchema>;
