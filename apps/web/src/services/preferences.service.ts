import type { PreferencesResponse, UpdateUserPreferencesInput } from "@weather-app/contracts";
import { apiRequest } from "./api-client";

export const getPreferences = (deviceToken: string) => apiRequest<PreferencesResponse>("/api/preferences", { deviceToken });

export const updatePreferences = (deviceToken: string, input: UpdateUserPreferencesInput) =>
  apiRequest<PreferencesResponse>("/api/preferences", { method: "PUT", deviceToken, body: input });
