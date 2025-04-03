// Initial Imports
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(
    "./cs-25-317-firebase-adminsdk-fbsvc-2c27dbbff6.json",
    "utf-8"
  )
);

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
  origin: [
    "http://localhost:3000",
    "http://localhost:5001",
    "http://localhost:5173",
    "http://localhost:3001",
    "http://127.0.0.1:5500",
  ],
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};

// Middleware to enable CORS and JSON parsing
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Global logs array and helper function
const logs = [];
function addLog(message) {
  console.log(message);
  logs.push(message);
}

// Function to save FCM token to Supabase
async function saveTokenToDatabase(token, userId) {
  const { data, error } = await supabase
    .from("user_devices")
    .upsert(
      { device_token: token, user_id: userId },
      { onConflict: ["user_id"] }
    );

  if (error) {
    console.error("Error saving token:", error);
  } else {
    addLog("FCM token saved successfully: " + JSON.stringify(data));
  }
}

// Endpoint to save FCM token from frontend
app.post("/save-token", async (req, res) => {
  addLog("Received request: " + JSON.stringify(req.body));
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

// Endpoint to retrieve logs
app.post("/test-send", async (req, res) => {
  const { token } = req.body;
  const message = {
    notification: {
      title: "Test",
      body: "This is a test message",
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// Function to check upcoming events and send notifications
async function sendReminderNotifications() {
  try {
    const currentTime = new Date();
    const timeZone = "America/New_York"; // EST timezone
    const timeRangeInMinutes = 1;

    // Format current date and time in EST using locale options
    const optionsDate = {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const optionsTime = {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };

    const formattedDate = currentTime.toLocaleDateString("en-CA", optionsDate);
    const formattedTime = currentTime.toLocaleTimeString("en-GB", optionsTime);

    const pastTime = new Date(
      currentTime.getTime() - timeRangeInMinutes * 60000
    );
    const futureTime = new Date(
      currentTime.getTime() + timeRangeInMinutes * 60000
    );
    const formattedPastTime = pastTime.toLocaleTimeString("en-GB", optionsTime);
    const formattedFutureTime = futureTime.toLocaleTimeString(
      "en-GB",
      optionsTime
    );

    addLog(
      `Checking events for date: ${formattedDate}, time range: ${formattedPastTime} to ${formattedFutureTime}`
    );

    const userId = 1; // Example user ID

    // Fetch events for the specified user, date, and time range
    const { data: events, error: eventError } = await supabase
      .from("events")
      .select("id, event_name, event_date, start_time, userid")
      .eq("userid", userId)
      .eq("event_date", formattedDate)
      .gte("start_time", formattedPastTime)
      .lte("start_time", formattedFutureTime);

    if (eventError) {
      addLog("Error fetching events: " + JSON.stringify(eventError));
      return;
    }

    if (!events || events.length === 0) {
      addLog("No events scheduled within the specified time range.");
      return;
    }

    addLog("Fetched events: " + JSON.stringify(events));

    // Process each event to send notifications
    for (const event of events) {
      // Fetch device tokens for the user associated with this event
      const { data: userDevices, error: deviceError } = await supabase
        .from("user_devices")
        .select("device_token")
        .eq("user_id", event.userid);

      if (deviceError) {
        addLog("Error fetching device tokens: " + JSON.stringify(deviceError));
        continue;
      }

      if (!userDevices || userDevices.length === 0) {
        addLog(`No registered devices for user ID: ${event.userid}`);
        continue;
      }

      // Log each token being used
      userDevices.forEach((device) => {
        addLog(
          `Attempting to send notification using token: ${device.device_token}`
        );
      });

      // Send notification to each token individually
      for (const device of userDevices) {
        const deviceToken = device.device_token;
        const message = {
          notification: {
            title: "Event Reminder",
            body: `Upcoming Event: ${event.event_name} at ${event.start_time}`,
          },
          token: deviceToken,
        };

        try {
          const response = await admin.messaging().send(message);
          addLog(
            `Notification sent for event: ${
              event.event_name
            } to token: ${deviceToken.substring(0, 10)}...`
          );
          addLog("FCM Response: " + response);
        } catch (err) {
          addLog(
            `FCM Error for token ${deviceToken.substring(0, 10)}...: ${err}`
          );
        }
      }
    }
  } catch (error) {
    addLog("Error in sendReminderNotifications: " + error);
  }
}

// Run the notification check every minute
setInterval(sendReminderNotifications, 60000);

// Start Express server
const PORT = 3002;
app.listen(PORT, () => {
  addLog(`Backend running on http://localhost:${PORT}`);
});
