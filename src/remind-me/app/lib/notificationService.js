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
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5500"], // Frontend URLs
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
  console.log('Received request:', req.body);  
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

async function sendNotificationToUser(event) {
  const { data: userDevices, error: deviceError } = await supabase
    .from("user_devices")
    .select("device_token")
    .eq("user_id", event.userid);

  if (deviceError) {
    console.error("Error fetching device tokens:", deviceError);
    return;
  }

  if (!userDevices || userDevices.length === 0) {
    console.log(`No registered devices for user ID: ${event.userid}`);
    return;
  }

  for (const device of userDevices) {
    const token = device.device_token;
    const message = {
      notification: {
        title: "Event Reminder",
        body: `Upcoming Event: ${event.event_name} at ${event.start_time}`,
      },
      token: token
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`Notification sent for event: ${event.event_name} to token: ${token.substring(0, 10)}...`);
      console.log("FCM Response:", response);
    } catch (err) {
      console.error(`FCM Error for token ${token.substring(0, 10)}...`, err);
    }
  }
}

function strToTime(timeStr){
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, seconds || 0, 0);
  return now;
}

//Hashmap to store events for interval checking
const eventsMap = new Map();

// Function to check upcoming events and send notifications
async function sendReminderNotifications() {
  try {
    const currentTime = new Date();
    currentTime.setDate(currentTime.getDate()+1);
    currentTime.setHours(currentTime.getHours()); // Convert UTC to EST

    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);
    
    const formattedDate = currentTime.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = currentTime.toTimeString().split(" ")[0]; // HH:MM:SS
    
    console.log(`Checking events for date: ${formattedDate}, time: ${formattedTime}`);    

    const userId = 1; 

    // Fetch events from database
    const { data: events, error: eventError } = await supabase.rpc(
      'get_events_with_adjusted_time',
      {
        p_user_id: userId,
        p_target_date: formattedDate,
        p_past_time: formattedTime,
        p_future_time: formattedTime
      }
    );

    if (eventError) {
      console.error("Error fetching events:", eventError);
      return;
    }

    if (!events || events.length === 0) {
      console.log("No events scheduled within the specified time range.");
      
    }


    for (const event of events) {
      //Add event time and adjusted for reccurent notifications
      const eventTime = new Date(`${event.event_date}T${event.start_time}`);
      const adjustedTime = new Date(eventTime.getTime() - event.interval * 60000);
      eventsMap.set(
        event,         
        adjustedTime.toTimeString().split(" ")[0] 
      );
    }

    for (const [event, adjustedTime] of eventsMap) {

      console.log(`Event: ${event.event_name}, Adjusted Time: ${adjustedTime}`);

      
      const f = strToTime(formattedTime);
      const a = strToTime(adjustedTime);

      console.log(`Current Time: ${f.getTime()}, Adjusted Time: ${a.getTime()}`);
      console.log(`Check: ${((f.getTime() - a.getTime())/1000/60)%5 === 0}`);

      if(formattedTime === event.start_time){
        await sendNotificationToUser(event);
        eventsMap.delete(event);
        console.log(`Event ${event.event_name} removed from eventsMap.`);
      }
      else if(((f.getTime() - a.getTime())/1000/60)%5 === 0){
        await sendNotificationToUser(event);
        console.log(`Event ${event.event_name} sent to user.`);
      }
    }
    
  } catch (error) {
    console.error("Error in sendReminderNotifications:", error);
  }
}

// Run function every minute to check reminders
setInterval(sendReminderNotifications, 60000);  // 60,000 ms = 1 minute

// Start Express server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
