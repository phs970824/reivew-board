const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "restaurant_board",
  max: 10,
});

async function testConnection({ log = false } = {}) {
  try {
    const result = await pool.query(
      'SELECT NOW() AS "serverTime"',
    );
    if (log) {
      console.log("PostgreSQL 연결 성공:", result.rows[0]);
    }
    return { connected: true, serverTime: result.rows[0].serverTime };
  } catch (error) {
    const message = error.message || error.code || "연결할 수 없습니다.";
    if (log) {
      console.error("PostgreSQL 연결 실패:", message);
    }
    return { connected: false, error: message };
  }
}

async function connectWithRetry(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const result = await testConnection({ log: true });
    if (result.connected) {
      return result;
    }
    console.log(`DB 연결 재시도 (${attempt}/${retries})...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return { connected: false, error: "재시도 횟수를 초과했습니다." };
}

module.exports = { pool, testConnection, connectWithRetry };
