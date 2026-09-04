require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { testConnection, connectWithRetry } = require("./src/config/db");
const { ensureUsersTable } = require("./src/models/user");
const { ensureRegionsTable } = require("./src/models/region");
const { ensurePostsTable } = require("./src/models/post");
const authRoutes = require("./src/routes/auth");
const uploadRoutes = require("./src/routes/upload");
const postRoutes = require("./src/routes/posts");
const { setupSwagger } = require("./src/config/swagger");

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "지역별 맛집 후기 공유 게시판 API",
    stage: 4,
  });
});

app.get("/health", async (req, res) => {
  const db = await testConnection();
  const ok = db.connected;

  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    database: ok ? "connected" : "disconnected",
    serverTime: db.serverTime ?? null,
    error: db.error ?? null,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", postRoutes);
setupSwagger(app);

app.listen(PORT, async () => {
  console.log(`Backend 서버 실행: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  const db = await connectWithRetry();
  if (db.connected) {
    try {
      await ensureUsersTable();
      await ensureRegionsTable();
      await ensurePostsTable();
      console.log("users, regions, posts 테이블 준비 완료");
    } catch (error) {
      console.error("테이블 준비 실패:", error.message);
    }
  }
});
