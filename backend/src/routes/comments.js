const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const { list, create, update, remove } = require("../controllers/commentController");

const router = express.Router();

/**
 * @openapi
 * /api/posts/{postId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: 댓글 목록
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users JOIN이 포함된 댓글 목록 (작성일 오름차순)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Comment"
 *       404:
 *         description: 게시글 없음
 *   post:
 *     tags: [Comments]
 *     summary: 댓글 작성
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: 이 집 국물 진짜 진하네요.
 *     responses:
 *       201:
 *         description: 생성된 댓글 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: "#/components/schemas/Comment"
 *       400:
 *         description: 내용 누락
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 게시글 없음
 */
router.get("/posts/:postId/comments", list);
router.post("/posts/:postId/comments", authMiddleware, create);

/**
 * @openapi
 * /api/comments/{id}:
 *   put:
 *     tags: [Comments]
 *     summary: 댓글 수정
 *     description: 작성자 본인만 수정할 수 있습니다. 다른 사용자의 댓글이면 403을 반환합니다.
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정된 댓글 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: "#/components/schemas/Comment"
 *       400:
 *         description: 내용 누락
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 작성자가 아님
 *       404:
 *         description: 댓글 없음
 *   delete:
 *     tags: [Comments]
 *     summary: 댓글 삭제
 *     description: 작성자 본인만 삭제할 수 있습니다. 다른 사용자의 댓글이면 403을 반환합니다.
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
 *         description: 댓글 없음
 */
router.put("/comments/:id", authMiddleware, update);
router.delete("/comments/:id", authMiddleware, remove);

module.exports = router;
