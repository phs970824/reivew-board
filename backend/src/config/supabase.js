const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

function storagePathFromPublicUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  const marker = "/object/public/post-images/";
  const index = String(imageUrl).indexOf(marker);
  if (index === -1) {
    return null;
  }

  const path = decodeURIComponent(imageUrl.slice(index + marker.length).split("?")[0]);
  return path || null;
}

async function removeStoredImage(imageUrl) {
  const supabase = getSupabase();
  const path = storagePathFromPublicUrl(imageUrl);
  if (!supabase || !path) {
    return;
  }

  const { error } = await supabase.storage.from("post-images").remove([path]);
  if (error) {
    console.error("스토리지 이미지 삭제 실패:", error.message);
  }
}

module.exports = { getSupabase, removeStoredImage };
