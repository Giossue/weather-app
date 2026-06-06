import type { LocationsResponse } from "@weather-app/contracts";
import { apiRequest } from "./api-client";

export const searchLocations = (q: string, limit = 5) => apiRequest<LocationsResponse>("/api/locations/search", { params: { q, limit } });
export const reverseLocation = (lat: number, lon: number, limit = 1) => apiRequest<LocationsResponse>("/api/locations/reverse", { params: { lat, lon, limit } });
