const { pool } = require("../config/db");

function extractFirstImageUrl(html) {
  return String(html ?? "").match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
}

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
  await pool.query(`
    ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0
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

const POST_LIST_FIELDS = `
  p.id,
  p.user_id,
  p.region_id,
  p.title,
  p.restaurant_name,
  p.image_url,
  p.created_at,
  p.view_count,
  u.nickname,
  r.name AS region_name
`;

async function findAllPosts({ regionId, page, limit }) {
  const params = [];
  let where = "";

  if (regionId) {
    params.push(regionId);
    where = "WHERE p.region_id = $1";
  }

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM posts p ${where}`,
    params,
  );
  const totalCount = countResult.rows[0]?.total ?? 0;

  const offset = (page - 1) * limit;
  const listParams = [...params, limit, offset];
  const limitPlaceholder = `$${params.length + 1}`;
  const offsetPlaceholder = `$${params.length + 2}`;

  const result = await pool.query(
    `
      SELECT
        ${POST_LIST_FIELDS}
      ${POST_FROM}
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
    `,
    listParams,
  );

  return { posts: result.rows, totalCount };
}

async function findPopularPosts({ page = 1, limit = 5 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const countResult = await pool.query("SELECT COUNT(*)::int AS total FROM posts");
  const totalCount = countResult.rows[0]?.total ?? 0;

  const result = await pool.query(
    `
      SELECT
        ${POST_LIST_FIELDS}
      ${POST_FROM}
      ORDER BY
        p.view_count DESC,
        p.created_at DESC
      LIMIT $1
      OFFSET $2
    `,
    [safeLimit, offset],
  );

  return { posts: result.rows, totalCount };
}

async function findPostById(id) {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.user_id,
        p.region_id,
        p.title,
        p.restaurant_name,
        p.image_url,
        p.content,
        p.created_at,
        p.view_count,
        u.nickname,
        r.name AS region_name
      ${POST_FROM}
      WHERE p.id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

async function incrementPostViews(id) {
  const result = await pool.query(
    `
      UPDATE posts
      SET view_count = view_count + 1
      WHERE id = $1
      RETURNING view_count
    `,
    [id],
  );
  return result.rows[0]?.view_count ?? null;
}

async function updatePost(id, {
  regionId,
  restaurantName,
  title,
  content,
  imageUrl,
}) {
  await pool.query(
    `
      UPDATE posts
      SET
        region_id = $2,
        restaurant_name = $3,
        title = $4,
        content = $5,
        image_url = $6
      WHERE id = $1
    `,
    [id, regionId, restaurantName, title, content, imageUrl],
  );

  return findPostById(id);
}

async function deletePost(id) {
  const result = await pool.query(
    `
      DELETE FROM posts
      WHERE id = $1
      RETURNING id, image_url
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

async function findGalleryPosts(limit = 9) {
  const result = await pool.query(
    `
      SELECT p.id, p.title, p.restaurant_name, p.image_url, p.content
      FROM posts p
      WHERE
        (p.image_url IS NOT NULL AND BTRIM(p.image_url) <> '')
        OR p.content ILIKE '%<img%'
        OR p.content ~* 'https?://\\S+\\.(png|jpe?g|gif|webp|avif)'
      ORDER BY p.created_at DESC
      LIMIT 30
    `,
  );

  const items = [];
  for (const row of result.rows) {
    const imageUrl =
      String(row.image_url ?? "").trim() ||
      extractFirstImageUrl(row.content) ||
      String(row.content ?? "").match(
        /https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif)/i,
      )?.[0] ||
      null;

    if (!imageUrl) {
      continue;
    }

    items.push({
      id: row.id,
      title: row.title,
      restaurantName: row.restaurant_name,
      imageUrl,
    });

    if (items.length >= limit) {
      break;
    }
  }

  return items;
}

module.exports = {
  ensurePostsTable,
  createPost,
  findAllPosts,
  findPopularPosts,
  findGalleryPosts,
  findPostById,
  incrementPostViews,
  updatePost,
  deletePost,
  extractFirstImageUrl,
};
