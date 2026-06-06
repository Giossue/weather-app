import { z } from "zod";
import { latitudeSchema, longitudeSchema, uuidSchema } from "../common";

export const favoriteLocationSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  state: z.string().nullable().optional(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type FavoriteLocation = z.infer<typeof favoriteLocationSchema>;

export const createFavoriteLocationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).nullable().optional(),
  country: z.string().trim().min(2).max(2),
  latitude: latitudeSchema,
  longitude: longitudeSchema
});
export type CreateFavoriteLocationInput = z.infer<typeof createFavoriteLocationSchema>;

export const reorderFavoritesSchema = z.object({
  orderedIds: z.array(uuidSchema).min(1)
});
export type ReorderFavoritesInput = z.infer<typeof reorderFavoritesSchema>;

export const favoritesResponseSchema = z.object({
  data: z.array(favoriteLocationSchema)
});
export type FavoritesResponse = z.infer<typeof favoritesResponseSchema>;
