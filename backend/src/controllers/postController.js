const {
  createPost,
  findAllPosts,
  findPopularPosts,
  findGalleryPosts,
  findPostById,
  incrementPostViews,
  updatePost,
  deletePost,
  extractFirstImageUrl,
} = require("../models/post");
const { findAllRegions } = require("../models/region");
const { removeStoredImage } = require("../config/supabase");

function parsePostId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function readPostFields(body) {
  const regionId = Number(body.region_id);
  const restaurantName = String(body.restaurant_name ?? "").trim();
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  const imageUrl =
    String(body.image_url ?? "").trim() || extractFirstImageUrl(content);

  return { regionId, restaurantName, title, content, imageUrl };
}

async function loadOwnedPost(req, res) {
  const id = parsePostId(req.params.id);
  if (!id) {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return null;
  }

  const post = await findPostById(id);
  if (!post) {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return null;
  }

  if (Number(post.user_id) !== Number(req.user.id)) {
    res.status(403).json({ message: "게시글을 수정하거나 삭제할 권한이 없습니다." });
    return null;
  }

  return post;
}

async function create(req, res) {
  const { regionId, restaurantName, title, content, imageUrl } = readPostFields(req.body);

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
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? "4"), 10) || 4, 1),
    50,
  );

  if (req.query.region_id && !regionId) {
    return res.status(400).json({ message: "지역 값이 올바르지 않습니다." });
  }

  try {
    const { posts, totalCount } = await findAllPosts({ regionId, page, limit });
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error("게시글 목록 실패:", error);
    return res.status(500).json({ message: "게시글을 불러오지 못했습니다." });
  }
}

async function popular(req, res) {
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? "5"), 10) || 5, 1),
    50,
  );

  try {
    const { posts, totalCount } = await findPopularPosts({ page, limit });
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error("인기글 목록 실패:", error);
    return res.status(500).json({ message: "인기글을 불러오지 못했습니다." });
  }
}

async function update(req, res) {
  try {
    const existing = await loadOwnedPost(req, res);
    if (!existing) {
      return undefined;
    }

    const { regionId, restaurantName, title, content, imageUrl } = readPostFields(req.body);
    if (!regionId || !restaurantName || !title || !content) {
      return res.status(400).json({
        message: "지역, 맛집 이름, 제목, 본문을 모두 입력해 주세요.",
      });
    }

    const post = await updatePost(existing.id, {
      regionId,
      restaurantName,
      title,
      content,
      imageUrl,
    });

    return res.status(200).json({
      message: "게시글이 수정되었습니다.",
      post,
    });
  } catch (error) {
    console.error("게시글 수정 실패:", error);
    return res.status(500).json({ message: "게시글 수정 중 오류가 발생했습니다." });
  }
}

async function remove(req, res) {
  try {
    const existing = await loadOwnedPost(req, res);
    if (!existing) {
      return undefined;
    }

    await deletePost(existing.id);
    await removeStoredImage(existing.image_url);

    return res.status(200).json({
      message: "게시글이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    return res.status(500).json({ message: "게시글 삭제 중 오류가 발생했습니다." });
  }
}

async function gallery(req, res) {
  try {
    const posts = await findGalleryPosts(9);
    return res.json({ posts });
  } catch (error) {
    console.error("갤러리 목록 실패:", error);
    return res.status(500).json({ message: "갤러리를 불러오지 못했습니다." });
  }
}

async function detail(req, res) {
  const id = parsePostId(req.params.id);
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

async function recordView(req, res) {
  const id = parsePostId(req.params.id);
  if (!id) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  try {
    const viewCount = await incrementPostViews(id);
    if (viewCount == null) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
    return res.json({ view_count: viewCount });
  } catch (error) {
    console.error("조회수 증가 실패:", error);
    return res.status(500).json({ message: "조회수를 반영하지 못했습니다." });
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

module.exports = { create, list, popular, gallery, detail, recordView, update, remove, listRegions };
