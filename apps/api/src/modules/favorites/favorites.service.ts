import { asc, eq, sql } from "drizzle-orm";
import type { CreateFavoriteLocationInput, FavoriteLocation } from "@weather-app/contracts";
import { favoriteLocations } from "@weather-app/db";
import { db } from "../../db/client";
import { notFound } from "../../shared/errors";
import { ensureDeviceProfile } from "./device-profile.service";

const mapFavorite = (row: typeof favoriteLocations.$inferSelect): FavoriteLocation => ({
  id: row.id,
  name: row.name,
  state: row.state,
  country: row.country,
  latitude: row.latitude,
  longitude: row.longitude,
  sortOrder: row.sortOrder,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
});

export class FavoritesService {
  async list(deviceToken: string): Promise<FavoriteLocation[]> {
    const profile = await ensureDeviceProfile(deviceToken);
    const rows = await db
      .select()
      .from(favoriteLocations)
      .where(eq(favoriteLocations.deviceProfileId, profile.id))
      .orderBy(asc(favoriteLocations.sortOrder), asc(favoriteLocations.createdAt));
    return rows.map(mapFavorite);
  }

  async create(deviceToken: string, input: CreateFavoriteLocationInput): Promise<FavoriteLocation> {
    const profile = await ensureDeviceProfile(deviceToken);
    const nextSortRows = await db
      .select({ value: sql<number>`coalesce(max(${favoriteLocations.sortOrder}), -1) + 1` })
      .from(favoriteLocations)
      .where(eq(favoriteLocations.deviceProfileId, profile.id));

    const created = await db
      .insert(favoriteLocations)
      .values({
        deviceProfileId: profile.id,
        name: input.name,
        state: input.state ?? null,
        country: input.country.toUpperCase(),
        latitude: input.latitude,
        longitude: input.longitude,
        sortOrder: Number(nextSortRows[0]?.value ?? 0)
      })
      .onConflictDoUpdate({
        target: [favoriteLocations.deviceProfileId, favoriteLocations.latitude, favoriteLocations.longitude],
        set: {
          name: input.name,
          state: input.state ?? null,
          country: input.country.toUpperCase(),
          updatedAt: sql`now()`
        }
      })
      .returning();

    return mapFavorite(created[0]!);
  }

  async remove(deviceToken: string, favoriteId: string): Promise<void> {
    const profile = await ensureDeviceProfile(deviceToken);
    const deleted = await db
      .delete(favoriteLocations)
      .where(sql`${favoriteLocations.id} = ${favoriteId} AND ${favoriteLocations.deviceProfileId} = ${profile.id}`)
      .returning({ id: favoriteLocations.id });
    if (!deleted[0]) throw notFound("Favorito no encontrado");
  }

  async reorder(deviceToken: string, orderedIds: string[]): Promise<FavoriteLocation[]> {
    const profile = await ensureDeviceProfile(deviceToken);
    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(favoriteLocations)
          .set({ sortOrder: index, updatedAt: new Date() })
          .where(sql`${favoriteLocations.id} = ${id} AND ${favoriteLocations.deviceProfileId} = ${profile.id}`);
      }
    });
    return this.list(deviceToken);
  }
}

export const favoritesService = new FavoritesService();
