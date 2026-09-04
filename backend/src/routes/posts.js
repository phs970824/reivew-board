const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const { create, list, detail, listRegions } = require("../controllers/postController");

const router = express.Router();

/**
 * @openapi
 * /api/regions:
 *   get:
 *     tags: [Posts]
 *     summary: 지역 목록
 *     responses:
 *       200:
 *         description: 지역 목록 반환
 */
router.get("/regions", listRegions);

/**
 * @openapi
 * /api/posts:
 *   get:
 *     tags: [Posts]
 *     summary: 게시글 목록
 *     parameters:
 *       - in: query
 *         name: region_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: 지역 ID. 없으면 전체 조회
 *     responses:
 *       200:
 *         description: 게시글 목록 반환
 *   post:
 *     tags: [Posts]
 *     summary: 게시글 작성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [region_id, restaurant_name, title, content]
 *             properties:
 *               region_id:
 *                 type: integer
 *                 example: 1
 *               restaurant_name:
 *                 type: string
 *                 example: 을지로 골목국밥
 *               title:
 *                 type: string
 *                 example: 국밥 한 그릇으로 하루가 든든
 *               content:
 *                 type: string
 *                 example: <p>국물이 진하고 고기 양이 많아요.</p>
 *               image_url:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: 게시글 등록 성공
 *       400:
 *         description: 필수 값 누락
 *       401:
 *         description: 인증 필요
 */
/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: 게시글 상세
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 게시글 상세 반환
 *       404:
 *         description: 게시글 없음
 */
router.get("/posts", list);
router.get("/posts/:id", detail);
router.post("/posts", authMiddleware, create);

module.exports = router;
