const { pool } = require("../config/db");

const PURPOSE_SIGNUP = "signup";
const PURPOSE_PASSWORD_RESET = "password_reset";

async function ensureEmailVerificationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      used_at TIMESTAMPTZ,
      purpose VARCHAR(32) NOT NULL DEFAULT 'signup'
    )
  `);
  await pool.query(`
    ALTER TABLE email_verifications
    ADD COLUMN IF NOT EXISTS purpose VARCHAR(32) NOT NULL DEFAULT 'signup'
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS email_verifications_email_created_at_idx
    ON email_verifications (email, created_at DESC)
  `);
}

async function invalidateByEmail(email, purpose) {
  if (purpose) {
    await pool.query(
      "DELETE FROM email_verifications WHERE email = $1 AND purpose = $2",
      [email, purpose],
    );
    return;
  }
  await pool.query("DELETE FROM email_verifications WHERE email = $1", [email]);
}

async function createVerification({ email, code, expiresAt, purpose = PURPOSE_SIGNUP }) {
  const result = await pool.query(
    `
      INSERT INTO email_verifications (email, code, expires_at, purpose)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, expires_at, created_at, purpose
    `,
    [email, code, expiresAt, purpose],
  );
  return result.rows[0];
}

async function findLatestByEmail(email, purpose = PURPOSE_SIGNUP) {
  const result = await pool.query(
    `
      SELECT id, email, code, expires_at, created_at, used_at, purpose
      FROM email_verifications
      WHERE email = $1 AND purpose = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [email, purpose],
  );
  return result.rows[0] ?? null;
}

async function markUsed(id) {
  const result = await pool.query(
    "UPDATE email_verifications SET used_at = NOW() WHERE id = $1 AND used_at IS NULL",
    [id],
  );
  return result.rowCount > 0;
}

async function findVerifiedByEmail(email, purpose = PURPOSE_SIGNUP) {
  const result = await pool.query(
    `
      SELECT id, email, used_at, purpose
      FROM email_verifications
      WHERE email = $1 AND purpose = $2 AND used_at IS NOT NULL
      ORDER BY used_at DESC
      LIMIT 1
    `,
    [email, purpose],
  );
  return result.rows[0] ?? null;
}

async function deleteByEmail(email, purpose) {
  if (purpose) {
    await pool.query(
      "DELETE FROM email_verifications WHERE email = $1 AND purpose = $2",
      [email, purpose],
    );
    return;
  }
  await pool.query("DELETE FROM email_verifications WHERE email = $1", [email]);
}

module.exports = {
  PURPOSE_SIGNUP,
  PURPOSE_PASSWORD_RESET,
  ensureEmailVerificationsTable,
  invalidateByEmail,
  createVerification,
  findLatestByEmail,
  markUsed,
  findVerifiedByEmail,
  deleteByEmail,
};
