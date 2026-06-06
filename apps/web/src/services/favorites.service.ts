import type { CreateFavoriteLocationInput, FavoriteLocation, FavoritesResponse, ReorderFavoritesInput } from "@weather-app/contracts";
import { apiRequest } from "./api-client";

export const getFavorites = (deviceToken: string) => apiRequest<FavoritesResponse>("/api/favorites", { deviceToken });

export const createFavorite = (deviceToken: string, input: CreateFavoriteLocationInput) =>
  apiRequest<{ data: FavoriteLocation }>("/api/favorites", { method: "POST", deviceToken, body: input });

export const deleteFavorite = (deviceToken: string, favoriteId: string) =>
  apiRequest<{ ok: true }>(`/api/favorites/${encodeURIComponent(favoriteId)}`, { method: "DELETE", deviceToken });

export const reorderFavorites = (deviceToken: string, input: ReorderFavoritesInput) =>
  apiRequest<FavoritesResponse>("/api/favorites/reorder", { method: "PATCH", deviceToken, body: input });
