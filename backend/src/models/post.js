const { pool } = require("../config/db");

async function ensurePostsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      region_id INT NOT NULL REFERENCES regions(id),
      restaurant_name VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      image_url VARCHAR(500),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function createPost({
  userId,
  regionId,
  restaurantName,
  title,
  content,
  imageUrl,
}) {
  const result = await pool.query(
    `
      INSERT INTO posts
        (user_id, region_id, restaurant_name, title, content, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, region_id, restaurant_name, title, content, image_url, created_at
    `,
    [userId, regionId, restaurantName, title, content, imageUrl],
  );

  return result.rows[0];
}

const POST_FROM = `
  FROM posts p
  JOIN users u ON u.id = p.user_id
  JOIN regions r ON r.id = p.region_id
`;

async function findAllPosts(regionId) {
  const params = [];
  let where = "";

  if (regionId) {
    params.push(regionId);
    where = "WHERE p.region_id = $1";
  }

  const result = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.created_at,
        u.nickname,
        r.name AS region_name
      ${POST_FROM}
      ${where}
      ORDER BY p.created_at DESC
    `,
    params,
  );

  return result.rows;
}

async function findPostById(id) {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.restaurant_name,
        p.image_url,
        p.content,
        p.created_at,
        u.nickname,
        r.name AS region_name
      ${POST_FROM}
      WHERE p.id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

module.exports = { ensurePostsTable, createPost, findAllPosts, findPostById };
