import { eq, sql } from "drizzle-orm";
import type { UpdateUserPreferencesInput, UserPreferences } from "@weather-app/contracts";
import { userPreferences } from "@weather-app/db";
import { db } from "../../db/client";
import { ensureDeviceProfile } from "../favorites/device-profile.service";

const mapPreferences = (row: typeof userPreferences.$inferSelect): UserPreferences => ({
  id: row.id,
  units: row.units,
  language: row.language,
  theme: row.theme,
  defaultLocationMode: row.defaultLocationMode,
  defaultFavoriteLocationId: row.defaultFavoriteLocationId,
  decorativeAnimations: row.decorativeAnimations,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
});

export class PreferencesService {
  async get(deviceToken: string): Promise<UserPreferences> {
    const profile = await ensureDeviceProfile(deviceToken);
    const rows = await db.select().from(userPreferences).where(eq(userPreferences.deviceProfileId, profile.id)).limit(1);
    if (rows[0]) return mapPreferences(rows[0]);
    const created = await db.insert(userPreferences).values({ deviceProfileId: profile.id }).returning();
    return mapPreferences(created[0]!);
  }

  async update(deviceToken: string, input: UpdateUserPreferencesInput): Promise<UserPreferences> {
    const profile = await ensureDeviceProfile(deviceToken);
    const rows = await db
      .insert(userPreferences)
      .values({
        deviceProfileId: profile.id,
        units: input.units ?? "metric",
        language: input.language ?? "es",
        theme: input.theme ?? "system",
        defaultLocationMode: input.defaultLocationMode ?? "geolocation",
        defaultFavoriteLocationId: input.defaultFavoriteLocationId ?? null,
        decorativeAnimations: input.decorativeAnimations ?? true
      })
      .onConflictDoUpdate({
        target: userPreferences.deviceProfileId,
        set: {
          ...(input.units ? { units: input.units } : {}),
          ...(input.language ? { language: input.language } : {}),
          ...(input.theme ? { theme: input.theme } : {}),
          ...(input.defaultLocationMode ? { defaultLocationMode: input.defaultLocationMode } : {}),
          ...("defaultFavoriteLocationId" in input ? { defaultFavoriteLocationId: input.defaultFavoriteLocationId ?? null } : {}),
          ...(input.decorativeAnimations !== undefined ? { decorativeAnimations: input.decorativeAnimations } : {}),
          updatedAt: sql`now()`
        }
      })
      .returning();
    return mapPreferences(rows[0]!);
  }
}

export const preferencesService = new PreferencesService();
