const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const { create, list, popular, gallery, detail, recordView, update, remove, listRegions } = require("../controllers/postController");

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
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 4
 *         description: 한 페이지당 게시글 수
 *       - in: query
 *         name: region_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: 지역 ID. 없으면 전체 조회
 *     responses:
 *       200:
 *         description: Users, Regions JOIN이 포함된 페이징 게시글 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/PostListItem"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     limit:
 *                       type: integer
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
 * /api/posts/popular:
 *   get:
 *     tags: [Posts]
 *     summary: 인기글 목록
 *     description: 조회수(view_count)가 높은 글부터 페이징합니다. 기본 한 페이지 5개입니다.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: 인기글 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/PostListItem"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     limit:
 *                       type: integer
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
 *         description: Users, Regions JOIN이 포함된 게시글 상세
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   $ref: "#/components/schemas/PostDetail"
 *       404:
 *         description: 게시글 없음
 *   put:
 *     tags: [Posts]
 *     summary: 게시글 수정
 *     description: 작성자 본인만 수정할 수 있습니다. 다른 사용자의 글이면 403을 반환합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               restaurant_name:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: 수정된 게시글 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: "#/components/schemas/PostDetail"
 *       400:
 *         description: 필수 값 누락
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 작성자가 아님
 *       404:
 *         description: 게시글 없음
 *   delete:
 *     tags: [Posts]
 *     summary: 게시글 삭제
 *     description: 작성자 본인만 삭제할 수 있습니다. 대표 이미지가 Supabase Storage에 있으면 함께 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 작성자가 아님
 *       404:
 *         description: 게시글 없음
 */
/**
 * @openapi
 * /api/posts/gallery:
 *   get:
 *     tags: [Posts]
 *     summary: 실시간 맛집 갤러리
 *     description: 대표 이미지(image_url)가 있거나 본문에 img 태그가 있는 최신 게시글 9개를 반환합니다.
 *     responses:
 *       200:
 *         description: 갤러리 게시글 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       restaurantName:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 */
/**
 * @openapi
 * /api/posts/{id}/view:
 *   post:
 *     tags: [Posts]
 *     summary: 조회수 증가
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 증가된 조회수
 *       404:
 *         description: 게시글 없음
 */
router.get("/posts/gallery", gallery);
router.get("/posts/popular", popular);
router.get("/posts", list);
router.get("/posts/:id", detail);
router.post("/posts/:id/view", recordView);
router.post("/posts", authMiddleware, create);
router.put("/posts/:id", authMiddleware, update);
router.delete("/posts/:id", authMiddleware, remove);

module.exports = router;
