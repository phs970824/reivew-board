const { pool } = require("../config/db");

async function ensureCommentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function findCommentsByPostId(postId) {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.created_at,
        u.nickname
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `,
    [postId],
  );

  return result.rows;
}

async function createComment({ postId, userId, content }) {
  const result = await pool.query(
    `
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, post_id, user_id, content, created_at
    `,
    [postId, userId, content],
  );

  const comment = result.rows[0];
  const userResult = await pool.query(
    "SELECT nickname FROM users WHERE id = $1",
    [userId],
  );

  return {
    ...comment,
    nickname: userResult.rows[0]?.nickname ?? "",
  };
}

async function findCommentById(id) {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.created_at,
        u.nickname
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

async function updateComment(id, content) {
  await pool.query(
    `
      UPDATE comments
      SET content = $2
      WHERE id = $1
    `,
    [id, content],
  );

  return findCommentById(id);
}

async function deleteComment(id) {
  const result = await pool.query(
    "DELETE FROM comments WHERE id = $1 RETURNING id",
    [id],
  );

  return result.rows[0] ?? null;
}

module.exports = {
  ensureCommentsTable,
  findCommentsByPostId,
  createComment,
  findCommentById,
  updateComment,
  deleteComment,
};
