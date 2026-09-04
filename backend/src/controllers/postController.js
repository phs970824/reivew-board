const { createPost, findAllPosts, findPostById } = require("../models/post");
const { findAllRegions } = require("../models/region");

function firstImageUrl(html) {
  const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

async function create(req, res) {
  const regionId = Number(req.body.region_id);
  const restaurantName = String(req.body.restaurant_name ?? "").trim();
  const title = String(req.body.title ?? "").trim();
  const content = String(req.body.content ?? "").trim();
  const imageUrl =
    String(req.body.image_url ?? "").trim() || firstImageUrl(content);

  if (!regionId || !restaurantName || !title || !content) {
    return res.status(400).json({
      message: "지역, 맛집 이름, 제목, 본문을 모두 입력해 주세요.",
    });
  }

  try {
    const post = await createPost({
      userId: req.user.id,
      regionId,
      restaurantName,
      title,
      content,
      imageUrl,
    });

    return res.status(201).json({
      message: "게시글이 등록되었습니다.",
      post,
    });
  } catch (error) {
    console.error("게시글 작성 실패:", error);
    return res.status(500).json({ message: "게시글 등록 중 오류가 발생했습니다." });
  }
}

async function list(req, res) {
  const regionId = req.query.region_id ? Number(req.query.region_id) : null;

  if (req.query.region_id && !regionId) {
    return res.status(400).json({ message: "지역 값이 올바르지 않습니다." });
  }

  try {
    const posts = await findAllPosts(regionId);
    return res.json({ posts });
  } catch (error) {
    console.error("게시글 목록 실패:", error);
    return res.status(500).json({ message: "게시글을 불러오지 못했습니다." });
  }
}

async function detail(req, res) {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  try {
    const post = await findPostById(id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
    return res.json({ post });
  } catch (error) {
    console.error("게시글 상세 실패:", error);
    return res.status(500).json({ message: "게시글을 불러오지 못했습니다." });
  }
}

async function listRegions(req, res) {
  try {
    const regions = await findAllRegions();
    return res.json({ regions });
  } catch (error) {
    console.error("지역 목록 실패:", error);
    return res.status(500).json({ message: "지역 목록을 불러오지 못했습니다." });
  }
}

module.exports = { create, list, detail, listRegions };
