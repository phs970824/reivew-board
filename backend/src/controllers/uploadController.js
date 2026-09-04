const { getSupabase } = require("../config/supabase");

async function uploadImage(req, res) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error("Supabase 클라이언트 생성 실패:", error);
    return res.status(500).json({ message: "스토리지 연결에 실패했습니다." });
  }

  if (!supabase) {
    return res.status(503).json({
      message: "Supabase 설정이 없습니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해 주세요.",
    });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "이미지 파일을 선택해 주세요." });
  }

  const safeName = file.originalname.replace(/[^\w.\-가-힣]/g, "_");
  const filePath = `${req.user.id}/${Date.now()}-${safeName}`;

  try {
    const { error } = await supabase.storage
      .from("post-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("이미지 업로드 실패:", error);
      return res.status(500).json({ message: "이미지 업로드에 실패했습니다." });
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);

    return res.status(201).json({
      message: "이미지가 업로드되었습니다.",
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    return res.status(500).json({ message: "이미지 업로드 처리 중 오류가 발생했습니다." });
  }
}

module.exports = { uploadImage };
