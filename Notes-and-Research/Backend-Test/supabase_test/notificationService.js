//Intial Imports
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync("./cs-25-317-firebase-adminsdk-fbsvc-2c27dbbff6.json", "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Express setup
const app = express();

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3001", "http://127.0.0.1:5500"], // Frontend URLs
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};

//Middleware to enable CORS and Express
app.use(cors(corsOptions)); // Allow requests from the specified origin
app.options("*", cors(corsOptions)); // Enable preflight for all routes
app.use(express.json());

// Function to save FCM token to Supabase
async function saveTokenToDatabase(token, userId) {
  const { data, error } = await supabase
    .from("user_devices")
    .upsert({ device_token: token, user_id: userId }, { onConflict: ["user_id"] });

  if (error) {
    console.error("Error saving token:", error);
  } else {
    console.log("FCM token saved successfully:", data);
  }
}

// Endpoint to save FCM token from frontend
app.post("/save-token", async (req, res) => {
  console.log('Received request:', req.body);  // Debugging the request body
  try {
    const { token, userId } = req.body;
    if (!token || !userId) {
      return res.status(400).json({ error: "Missing token or userId" });
    }
    await saveTokenToDatabase(token, userId);
    res.status(200).json({ message: "Token saved successfully" });
  } catch (error) {
    console.error("Error in /save-token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to check upcoming events and send notifications
async function sendReminderNotifications() {
  try {
    const currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - 1);

    const formattedDate = currentTime.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = currentTime.toTimeString().split(" ")[0]; // HH:MM:SS

    const timeRangeInMinutes = 5;
    const pastTime = new Date(currentTime.getTime() - timeRangeInMinutes * 60000);
    const futureTime = new Date(currentTime.getTime() + timeRangeInMinutes * 60000);

    const formattedPastTime = pastTime.toTimeString().split(" ")[0];
    const formattedFutureTime = futureTime.toTimeString().split(" ")[0];

    const userId = 1; // User ID you want to filter by

    // Fetch events from database
    const { data: events, error: eventError } = await supabase
      .from("events")
      .select("id, event_name, event_date, start_time, userid")
      .eq("userid", userId)
      .eq("event_date", formattedDate)
      .gte("start_time", formattedPastTime)
      .lte("start_time", formattedFutureTime);


    if (eventError) {
      console.error("Error fetching events:", eventError);
      return;
    }

    if (!events || events.length === 0) {
      console.log("No events scheduled within the specified time range.");
      return;
    }

    console.log("Fetched events:", events);

    for (const event of events) {
      // Fetch device tokens for the user associated with this event
      const { data: userDevices, error: deviceError } = await supabase
        .from("user_devices")
        .select("device_token")
        .eq("user_id", event.userid);

      if (deviceError) {
        console.error("Error fetching device tokens:", deviceError);
        continue;
      }

      if (!userDevices || userDevices.length === 0) {
        console.log(`No registered devices for user ID: ${event.userid}`);
        continue;
      }

      // Send notification to each token individually
      for (const device of userDevices) {
        const token = device.device_token;
        
        // Basic message structure
        const message = {
          notification: {
            title: "Event Reminder",
            body: `Upcoming Event: ${event.event_name} at ${event.start_time}`,
          },
          token: token
        };

        try {
          // Use the basic send() method that should be available in all versions
          const response = await admin.messaging().send(message);
          console.log(`Notification sent for event: ${event.event_name} to token: ${token.substring(0, 10)}...`);
          console.log("FCM Response:", response);
        } catch (err) {
          console.error(`FCM Error for token ${token.substring(0, 10)}...`, err);
        }
      }
    }
  } catch (error) {
    console.error("Error in sendReminderNotifications:", error);
  }
}

// Run function every minute to check reminders
setInterval(sendReminderNotifications, 15000);  // 15,000 ms = 15 seconds

// Start Express server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});