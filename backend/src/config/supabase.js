const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    realtime: {
      transport: ws,
    },
  });
}

module.exports = { getSupabase };
