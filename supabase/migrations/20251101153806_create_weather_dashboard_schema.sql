/*
  # Weather Analytics Dashboard Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User ID from auth.users
      - `email` (text) - User email
      - `temperature_unit` (text) - User preference: 'celsius' or 'fahrenheit'
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `favorite_cities`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References users table
      - `city_name` (text) - City name
      - `country_code` (text) - Country code
      - `latitude` (numeric) - City latitude
      - `longitude` (numeric) - City longitude
      - `created_at` (timestamptz) - When favorite was added
    
    - `weather_cache`
      - `id` (uuid, primary key) - Unique identifier
      - `cache_key` (text, unique) - Cache identifier
      - `data` (jsonb) - Cached weather data
      - `cached_at` (timestamptz) - When data was cached
      - `expires_at` (timestamptz) - When cache expires (60s)
  
  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Weather cache is accessible to all authenticated users
    - Add indexes for performance
  
  3. Important Notes
    - Temperature unit defaults to 'celsius'
    - Cache expires after 60 seconds for real-time data
    - Favorite cities are user-specific and persist across sessions
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  temperature_unit text DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS favorite_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_name text NOT NULL,
  country_code text NOT NULL,
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, city_name, country_code)
);

ALTER TABLE favorite_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorite_cities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorite_cities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_cities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS weather_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  cached_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '60 seconds')
);

ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cache"
  ON weather_cache FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Authenticated users can insert cache"
  ON weather_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cache"
  ON weather_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_favorite_cities_user_id ON favorite_cities(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_cache_key ON weather_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;