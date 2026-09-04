const { pool } = require("../config/db");

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nickname VARCHAR(50) NOT NULL,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT TRUE
  `);
  await pool.query(`
    ALTER TABLE users
    ALTER COLUMN is_verified SET DEFAULT FALSE
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)
  `);
}

async function findByEmail(email) {
  const result = await pool.query(
    "SELECT id, email, password, nickname, is_verified FROM users WHERE LOWER(email) = LOWER($1)",
    [email],
  );
  return result.rows[0] ?? null;
}

async function createUser({ email, passwordHash, nickname }) {
  const result = await pool.query(
    `INSERT INTO users (email, password, nickname, is_verified)
     VALUES ($1, $2, $3, TRUE)
     RETURNING id, email, nickname, is_verified`,
    [email, passwordHash, nickname],
  );

  return result.rows[0];
}

async function updatePasswordByEmail(email, passwordHash) {
  const result = await pool.query(
    `UPDATE users
     SET password = $2
     WHERE LOWER(email) = LOWER($1)
     RETURNING id, email, nickname`,
    [email, passwordHash],
  );
  return result.rows[0] ?? null;
}

module.exports = { ensureUsersTable, findByEmail, createUser, updatePasswordByEmail };
