DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS variants;
DROP TABLE IF EXISTS experiments;
DROP TABLE IF EXISTS types;

CREATE TABLE types (
  id serial PRIMARY KEY,  
  type text NOT NULL UNIQUE
);

CREATE TABLE experiments (
  id serial PRIMARY KEY,
  type_id int NOT NULL REFERENCES types(id),
  name text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_running boolean DEFAULT false NOT NULL,
  user_percentage decimal NOT NULL DEFAULT 1.0 CHECK (user_percentage BETWEEN 0.0 AND 1.0)
);

CREATE TABLE variants (
  id serial PRIMARY KEY,
  experiment_id int NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  value text NOT NULL,
  is_control boolean DEFAULT false,
  weight decimal NOT NULL DEFAULT 0.5 CHECK (weight BETWEEN 0.0 AND 1.0)
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  variant_id int NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  ip_address inet NOT NULL
);

CREATE TABLE events (
  id serial PRIMARY KEY,
  variant_id int NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_stamp timestamp NOT NULL DEFAULT now()
);

INSERT INTO types (type)
VALUES ('toggle'), ('rollout'), ('experiment');


