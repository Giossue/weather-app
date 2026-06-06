CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE units AS ENUM ('metric', 'imperial', 'standard');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE theme AS ENUM ('light', 'dark', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE default_location_mode AS ENUM ('geolocation', 'favorite');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE weather_endpoint_type AS ENUM (
    'current',
    'minute',
    'quarter_hour',
    'hourly',
    'daily',
    'alert',
    'geocoding_direct',
    'geocoding_reverse'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS device_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_token uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorite_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_profile_id uuid NOT NULL REFERENCES device_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  state text,
  country text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS favorite_locations_device_sort_idx ON favorite_locations(device_profile_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS favorite_locations_device_coords_idx ON favorite_locations(device_profile_id, latitude, longitude);

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_profile_id uuid NOT NULL UNIQUE REFERENCES device_profiles(id) ON DELETE CASCADE,
  units units NOT NULL DEFAULT 'metric',
  language text NOT NULL DEFAULT 'es',
  theme theme NOT NULL DEFAULT 'system',
  default_location_mode default_location_mode NOT NULL DEFAULT 'geolocation',
  default_favorite_location_id uuid REFERENCES favorite_locations(id) ON DELETE SET NULL,
  decorative_animations boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_device_profile_idx ON user_preferences(device_profile_id);

CREATE TABLE IF NOT EXISTS weather_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  endpoint_type weather_endpoint_type NOT NULL,
  latitude double precision,
  longitude double precision,
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS weather_cache_key_idx ON weather_cache(cache_key);
CREATE INDEX IF NOT EXISTS weather_cache_expires_at_idx ON weather_cache(expires_at);

CREATE TABLE IF NOT EXISTS weather_api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_type weather_endpoint_type NOT NULL,
  status_code integer NOT NULL,
  was_cached boolean NOT NULL DEFAULT false,
  duration_ms integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS weather_api_request_logs_created_at_idx ON weather_api_request_logs(created_at);
