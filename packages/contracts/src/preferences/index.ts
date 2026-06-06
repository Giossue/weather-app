import { z } from "zod";
import { defaultLocationModeSchema, languageSchema, themeSchema, unitsSchema, uuidSchema } from "../common";

export const userPreferencesSchema = z.object({
  id: uuidSchema,
  units: unitsSchema,
  language: languageSchema,
  theme: themeSchema,
  defaultLocationMode: defaultLocationModeSchema,
  defaultFavoriteLocationId: uuidSchema.nullable().optional(),
  decorativeAnimations: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const updateUserPreferencesSchema = z.object({
  units: unitsSchema.optional(),
  language: languageSchema.optional(),
  theme: themeSchema.optional(),
  defaultLocationMode: defaultLocationModeSchema.optional(),
  defaultFavoriteLocationId: uuidSchema.nullable().optional(),
  decorativeAnimations: z.boolean().optional()
});
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;

export const preferencesResponseSchema = z.object({
  data: userPreferencesSchema
});
export type PreferencesResponse = z.infer<typeof preferencesResponseSchema>;
