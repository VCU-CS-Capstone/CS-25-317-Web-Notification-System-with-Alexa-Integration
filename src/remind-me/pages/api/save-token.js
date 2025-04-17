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
    // First check if this exact token already exists for this user
    const { data: existingToken, error: checkError } = await supabase
      .from("user_devices")
      .select("*")
      .eq("device_token", token)
      .eq("user_id", userId);

    if (checkError) {
      console.error("Error checking existing token:", checkError);
      return res.status(500).json({ error: "Database error" });
    }

    // If token doesn't exist for this user, insert it as a new device
    if (!existingToken || existingToken.length === 0) {
      const { data, error } = await supabase
        .from("user_devices")
        .insert([{ device_token: token, user_id: userId }]);

      if (error) {
        console.error("Error saving token:", error);
        return res.status(500).json({ error: "Database error" });
      }
    }

    // Handle device name if provided
    const deviceName = req.body.deviceName;
    if (deviceName) {
      const { error: updateError } = await supabase
        .from("user_devices")
        .update({ device_name: deviceName })
        .eq("device_token", token)
        .eq("user_id", userId);
        
      if (updateError) {
        console.error("Error updating device name:", updateError);
        // Continue anyway since the token was saved
      }
    }

    return res.status(200).json({ message: "Token saved successfully" });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
