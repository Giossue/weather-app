import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const unitsEnum = pgEnum("units", ["metric", "imperial", "standard"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);
export const defaultLocationModeEnum = pgEnum("default_location_mode", ["geolocation", "favorite"]);
export const weatherEndpointTypeEnum = pgEnum("weather_endpoint_type", [
  "current",
  "minute",
  "quarter_hour",
  "hourly",
  "daily",
  "alert",
  "geocoding_direct",
  "geocoding_reverse"
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};

export const deviceProfiles = pgTable("device_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceToken: uuid("device_token").notNull().unique(),
  ...timestamps
});

export const favoriteLocations = pgTable(
  "favorite_locations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    deviceProfileId: uuid("device_profile_id")
      .notNull()
      .references(() => deviceProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    state: text("state"),
    country: text("country").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps
  },
  (table) => ({
    deviceSortIdx: index("favorite_locations_device_sort_idx").on(table.deviceProfileId, table.sortOrder),
    uniqueLocationIdx: uniqueIndex("favorite_locations_device_coords_idx").on(
      table.deviceProfileId,
      table.latitude,
      table.longitude
    )
  })
);

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    deviceProfileId: uuid("device_profile_id")
      .notNull()
      .unique()
      .references(() => deviceProfiles.id, { onDelete: "cascade" }),
    units: unitsEnum("units").notNull().default("metric"),
    language: text("language").notNull().default("es"),
    theme: themeEnum("theme").notNull().default("system"),
    defaultLocationMode: defaultLocationModeEnum("default_location_mode").notNull().default("geolocation"),
    defaultFavoriteLocationId: uuid("default_favorite_location_id").references(() => favoriteLocations.id, {
      onDelete: "set null"
    }),
    decorativeAnimations: boolean("decorative_animations").notNull().default(true),
    ...timestamps
  },
  (table) => ({
    deviceProfileIdx: uniqueIndex("user_preferences_device_profile_idx").on(table.deviceProfileId)
  })
);

export const weatherCache = pgTable(
  "weather_cache",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    cacheKey: text("cache_key").notNull().unique(),
    endpointType: weatherEndpointTypeEnum("endpoint_type").notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    payload: jsonb("payload").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps
  },
  (table) => ({
    cacheKeyIdx: uniqueIndex("weather_cache_key_idx").on(table.cacheKey),
    expiresAtIdx: index("weather_cache_expires_at_idx").on(table.expiresAt)
  })
);

export const weatherApiRequestLogs = pgTable(
  "weather_api_request_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    endpointType: weatherEndpointTypeEnum("endpoint_type").notNull(),
    statusCode: integer("status_code").notNull(),
    wasCached: boolean("was_cached").notNull().default(false),
    durationMs: integer("duration_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    createdAtIdx: index("weather_api_request_logs_created_at_idx").on(table.createdAt)
  })
);

export const deviceProfilesRelations = relations(deviceProfiles, ({ many, one }) => ({
  favorites: many(favoriteLocations),
  preferences: one(userPreferences)
}));

export const favoriteLocationsRelations = relations(favoriteLocations, ({ one }) => ({
  deviceProfile: one(deviceProfiles, {
    fields: [favoriteLocations.deviceProfileId],
    references: [deviceProfiles.id]
  })
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  deviceProfile: one(deviceProfiles, {
    fields: [userPreferences.deviceProfileId],
    references: [deviceProfiles.id]
  }),
  defaultFavoriteLocation: one(favoriteLocations, {
    fields: [userPreferences.defaultFavoriteLocationId],
    references: [favoriteLocations.id]
  })
}));
