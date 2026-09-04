const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "restaurant_board",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    const [rows] = await connection.query("SELECT 1 AS ok, NOW() AS serverTime");
    connection.release();
    console.log("MySQL 연결 성공:", rows[0]);
    return { connected: true, serverTime: rows[0].serverTime };
  } catch (error) {
    const message = error.message || error.code || "연결할 수 없습니다.";
    console.error("MySQL 연결 실패:", message);
    return { connected: false, error: message };
  }
}

async function connectWithRetry(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const result = await testConnection();
    if (result.connected) {
      return result;
    }
    console.log(`DB 연결 재시도 (${attempt}/${retries})...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return { connected: false, error: "재시도 횟수를 초과했습니다." };
}

module.exports = { pool, testConnection, connectWithRetry };
