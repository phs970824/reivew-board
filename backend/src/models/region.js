const { pool } = require("../config/db");

const REGION_NAMES = ["서울", "경기", "강원", "충청", "전라", "경상", "제주"];

async function ensureRegionsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS regions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL
    )
  `);

  await pool.query(
    `
      INSERT INTO regions (name)
      SELECT unnest($1::text[])
      ON CONFLICT (name) DO NOTHING
    `,
    [REGION_NAMES],
  );
}

async function findAllRegions() {
  const result = await pool.query(
    "SELECT id, name FROM regions ORDER BY id ASC",
  );
  return result.rows;
}

module.exports = { ensureRegionsTable, findAllRegions };
