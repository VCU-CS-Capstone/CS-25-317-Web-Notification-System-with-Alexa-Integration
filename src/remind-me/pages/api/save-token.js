import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, userId } = req.body;

  if (!token || !userId) {
    return res.status(400).json({ error: "Missing token or userId" });
  }

  try {
    const { data, error } = await supabase
      .from("user_devices")
      .upsert(
        { device_token: token, user_id: userId },
        { onConflict: ["user_id"] }
      );

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json({ message: "Token saved successfully" });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
