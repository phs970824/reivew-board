require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { testConnection, connectWithRetry } = require("./src/config/db");

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "지역별 맛집 후기 공유 게시판 API",
    stage: 1,
  });
});

app.get("/health", async (req, res) => {
  const db = await testConnection();
  const ok = db.connected;

  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    service: "backend",
    database: ok ? "connected" : "disconnected",
    serverTime: db.serverTime ?? null,
    error: db.error ?? null,
  });
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Backend 서버 실행: http://localhost:${PORT}`);
  await connectWithRetry();
});
