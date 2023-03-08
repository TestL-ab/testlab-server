DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS variants;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS userblocks;

CREATE TABLE types (
  id serial PRIMARY KEY,  
  type text NOT NULL UNIQUE
);

CREATE TABLE features (
  id serial PRIMARY KEY,
  type_id int NOT NULL REFERENCES types(id),
  name text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_running boolean DEFAULT true NOT NULL,
  user_percentage decimal NOT NULL DEFAULT 1.0 CHECK (user_percentage BETWEEN 0.0 AND 1.0),
  hypothesis text DEFAULT NULL
);

CREATE TABLE variants (
  id serial PRIMARY KEY,
  feature_id int NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  value text NOT NULL,
  is_control boolean DEFAULT false,
  weight decimal NOT NULL DEFAULT 0.5 CHECK (weight BETWEEN 0.0 AND 1.0)
);

CREATE TABLE users (
  id text PRIMARY KEY,
  variant_id int NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  ip_address inet NOT NULL,
  time_stamp timestamp NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id serial PRIMARY KEY,
  variant_id int NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_stamp timestamp NOT NULL DEFAULT now()
);

INSERT INTO types (type)
VALUES ('toggle'), ('rollout'), ('experiment');


CREATE TABLE userblocks (
  id serial PRIMARY KEY,
  name text,
  feature_id int DEFAULT NULL
);

INSERT INTO userblocks (name) VALUES (5), (10), (15), (20), (25), (30), (35), (40), (45), (50), (55), (60), (65), (70), (75), (80), (85), (90), (95), (100);