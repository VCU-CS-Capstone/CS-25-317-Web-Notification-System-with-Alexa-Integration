export default function handler(req, res) {
    if (req.method === "POST") {
      console.log("🔥 Client error received:", req.body);
      return res.status(200).json({ status: "logged" });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  }
  