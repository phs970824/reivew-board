const { findPostById } = require("../models/post");
const {
  findCommentsByPostId,
  createComment,
  findCommentById,
  updateComment,
  deleteComment,
} = require("../models/comment");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function list(req, res) {
  const postId = parseId(req.params.postId);
  if (!postId) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  try {
    const post = await findPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const comments = await findCommentsByPostId(postId);
    return res.json({ comments });
  } catch (error) {
    console.error("댓글 목록 실패:", error);
    return res.status(500).json({ message: "댓글을 불러오지 못했습니다." });
  }
}

async function create(req, res) {
  const postId = parseId(req.params.postId);
  if (!postId) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  const content = String(req.body.content ?? "").trim();
  if (!content) {
    return res.status(400).json({ message: "댓글 내용을 입력해 주세요." });
  }

  try {
    const post = await findPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const comment = await createComment({
      postId,
      userId: req.user.id,
      content,
    });

    return res.status(201).json({
      message: "댓글이 등록되었습니다.",
      comment,
    });
  } catch (error) {
    console.error("댓글 작성 실패:", error);
    return res.status(500).json({ message: "댓글 등록 중 오류가 발생했습니다." });
  }
}

async function loadOwnedComment(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    return null;
  }

  const comment = await findCommentById(id);
  if (!comment) {
    res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    return null;
  }

  if (Number(comment.user_id) !== Number(req.user.id)) {
    res.status(403).json({ message: "댓글을 수정하거나 삭제할 권한이 없습니다." });
    return null;
  }

  return comment;
}

async function update(req, res) {
  try {
    const existing = await loadOwnedComment(req, res);
    if (!existing) {
      return undefined;
    }

    const content = String(req.body.content ?? "").trim();
    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해 주세요." });
    }

    const comment = await updateComment(existing.id, content);
    return res.status(200).json({
      message: "댓글이 수정되었습니다.",
      comment,
    });
  } catch (error) {
    console.error("댓글 수정 실패:", error);
    return res.status(500).json({ message: "댓글 수정 중 오류가 발생했습니다." });
  }
}

async function remove(req, res) {
  try {
    const existing = await loadOwnedComment(req, res);
    if (!existing) {
      return undefined;
    }

    await deleteComment(existing.id);
    return res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    return res.status(500).json({ message: "댓글 삭제 중 오류가 발생했습니다." });
  }
}

module.exports = { list, create, update, remove };
