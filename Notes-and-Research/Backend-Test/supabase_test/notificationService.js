const admin = require("firebase-admin");
const { createClient } = require("@supabase/supabase-js");

// Initialize Firebase Admin
const serviceAccount = require("./cs-25-317-firebase-adminsdk-fbsvc-2c27dbbff6.json"); // Your Firebase credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Function to check upcoming events and send notifications
async function sendReminderNotifications() {
  const currentTime = new Date();
  const formattedTime = currentTime.toISOString().split("T")[1].split(".")[0]; // Extract time

  // Fetch events that should trigger reminders
  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("id, event_name, event_date, start_time, userID")
    .eq("event_date", currentTime.toISOString().split("T")[0]) // Only today's events
    .lte("start_time", formattedTime) // Events starting now or earlier
    .not("start_time", "is", null);

  if (eventError) {
    console.error("Error fetching events:", eventError);
    return;
  }

  for (const event of events) {
    // Fetch device tokens for this event
    const { data: reminders, error: reminderError } = await supabase
      .from("reminder_info")
      .select("device_token")
      .eq("event", event.id)
      .eq("is_read", false); // Only unread reminders

    if (reminderError || !reminders || reminders.length === 0) continue;

    const tokens = reminders.map((r) => r.device_token);
    const message = {
      notification: {
        title: "Event Reminder",
        body: `Upcoming Event: ${event.event_name} at ${event.start_time}`,
      },
      tokens,
    };

    try {
      await admin.messaging().sendMulticast(message);
      console.log("Notification sent for event:", event.event_name);
      
      // Mark reminders as read after sending
      await supabase
        .from("reminder_info")
        .update({ is_read: true })
        .eq("event", event.id);
    } catch (err) {
      console.error("FCM Error:", err);
    }
  }
}

// Run function every minute to check reminders
setInterval(sendReminderNotifications, 60000);
