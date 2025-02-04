// Requirements
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt"); // Import bcrypt for hashing
require("dotenv").config();

const app = express();
const PORT = 5001;

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware to enable CORS
app.use(cors());
app.use(express.json());

// Get all users
app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get user's events
app.get("/events", async (req, res) => {
  const { userid } = req.query;
  if (!userid) {
    return res.status(400).json({ error: "Username is required" });
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("userid", userid);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

// Add new user
app.post("/users", async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({ username, email, password: hashedPassword, role: "user" });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

// Login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("password, id, username")
    .eq("email", email);

  if (error) return res.status(500).json({ error: error.message });
  if (data.length === 0)
    return res.status(404).json({ error: "User not found" });

  const user = data[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    return res.status(200).json({ id: user.id, username: user.username });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "User deleted successfully" });
});

// Add new event
app.post("/events", async (req, res) => {
  const { name, date, start_time, end_time, interval, sessionId } = req.body;
  const true_end = end_time ? end_time : null;
  const { data, error } = await supabase.from("events").insert({
    event_name: name,
    start_time,
    end_time: true_end,
    event_date: date,
    interval,
    userid: sessionId,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

// Delete event
app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "Event deleted successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
