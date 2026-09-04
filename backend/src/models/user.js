const { pool } = require("../config/db");

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nickname VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function findByEmail(email) {
  const result = await pool.query(
    "SELECT id, email, password, nickname FROM users WHERE email = $1",
    [email],
  );
  return result.rows[0] ?? null;
}

async function createUser({ email, passwordHash, nickname }) {
  const result = await pool.query(
    `INSERT INTO users (email, password, nickname)
     VALUES ($1, $2, $3)
     RETURNING id, email, nickname`,
    [email, passwordHash, nickname],
  );

  return result.rows[0];
}

module.exports = { ensureUsersTable, findByEmail, createUser };
