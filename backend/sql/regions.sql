CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO regions (name) VALUES
  ('서울'),
  ('경기'),
  ('강원'),
  ('충청'),
  ('전라'),
  ('경상'),
  ('제주')
ON CONFLICT (name) DO NOTHING;
