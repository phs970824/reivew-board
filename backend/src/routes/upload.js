const express = require("express");
const multer = require("multer");
const { authMiddleware } = require("../middlewares/auth");
const { uploadImage } = require("../controllers/uploadController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("이미지 파일만 업로드할 수 있습니다."));
  },
});

const router = express.Router();

/**
 * @openapi
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Supabase Storage 이미지 업로드
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 업로드 성공, Public Image URL 반환
 *       400:
 *         description: 파일이 없거나 형식이 잘못됨
 *       401:
 *         description: 인증 필요
 *       503:
 *         description: Supabase 환경 변수 없음
 */
router.post("/", authMiddleware, (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    return next();
  });
}, uploadImage);

module.exports = router;
