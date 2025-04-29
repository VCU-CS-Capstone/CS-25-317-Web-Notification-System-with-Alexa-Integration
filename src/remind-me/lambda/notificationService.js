// notificationService.js
const admin       = require("firebase-admin");
const { createClient } = require("@supabase/supabase-js");
const { DateTime }     = require("luxon");

let initialized = false;
let supabase;

exports.handler = async () => {
  // ────────────────────────────────────────
  //  INIT (cold start only)
  // ────────────────────────────────────────
  if (!initialized) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    initialized = true;
  }

  // ────────────────────────────────────────
  //  CONFIGURE FOR A SINGLE USER (or loop this for multi-user)
  // ────────────────────────────────────────
  const userId = 1;  // ← replace or loop over all your users

  // 1) pull that user's IANA tz string
  const { data: settings, error: setErr } = await supabase
    .from("user_settings")
    .select("timezone")
    .eq("user_id", userId)
    .single();

  const userTz = setErr || !settings?.timezone
    ? "UTC"
    : settings.timezone;

  // ────────────────────────────────────────
  //  "NOW" in the user's local clock, floored to the minute
  // ────────────────────────────────────────
  const nowLocal = DateTime
    .now()
    .setZone(userTz)
    .set({ second: 0, millisecond: 0 });

  const formattedDate = nowLocal.toFormat("yyyy-LL-dd");   // e.g. "2025-04-17"
  const formattedTime = nowLocal.toFormat("HH:mm:ss");     // e.g. "09:30:00"

  console.log(`🔁 Triggered at ${nowLocal.toISO()} (${userTz}) → ${formattedDate} ${formattedTime}`);

  // helper: turn "HH:mm:ss" into a JS Date in that same zone
  const strToTime = (timeStr) =>
    DateTime
      .fromFormat(`${formattedDate} ${timeStr}`, "yyyy-LL-dd HH:mm:ss", { zone: userTz })
      .toJSDate();

  const f = strToTime(formattedTime);

  try {
    // ────────────────────────────────────────
    // STEP 0: fetch today's events for this user, compute adj_time
    // ────────────────────────────────────────
    const { data: events, error: eventsErr } = await supabase
      .from("events")
      .select("id, userid, event_name, event_date, start_time, interval")
      .eq("userid", userId)
      .eq("event_date", formattedDate);

    if (eventsErr) {
      console.error("❌ Error fetching events:", eventsErr);
    } else if (events.length) {
      const toUpsert = events.map(e => {
        // Handle potentially missing start_time
        if (!e.start_time) {
          console.warn(`⚠️ Missing start_time for event ${e.id}`);
          return null;
        }
        
        // parse the event start in the user's zone
        const evtLocal = DateTime.fromFormat(
          `${e.event_date} ${e.start_time}`,
          "yyyy-LL-dd HH:mm:ss",
          { zone: userTz }
        );
        // subtract the interval
        const adjLocal = evtLocal.minus({ minutes: e.interval || 0 });
        return {
          event_id: e.id,
          adj_time: adjLocal.toFormat("HH:mm:ss")
        };
      }).filter(Boolean); // Remove null entries

      if (toUpsert.length > 0) {
        const { error: upErr } = await supabase
          .from("map")
          .upsert(toUpsert, { onConflict: "event_id" });

        if (upErr) console.error("❌ Error upserting map rows:", upErr);
        else console.log(`📝 Upserted ${toUpsert.length} map rows`);
      }
    }

    // ────────────────────────────────────────
    // STEP 1: get only unchecked map‑rows for today
    // ────────────────────────────────────────
    const { data: maps, error: mapErr } = await supabase
      .from("map")
      .select(`
        id,
        check,
        adj_time,
        event:event_id (
          id,
          userid,
          event_name,
          event_date,
          start_time
        )
      `)
      .eq("event.userid", userId)
      .eq("event.event_date", formattedDate)
      .eq("check", false);

    if (mapErr) {
      console.error("❌ Error fetching map rows:", mapErr);
      return;
    }
    if (!maps.length) {
      console.log("📭 No unchecked reminders for today");
      return;
    }

    // ────────────────────────────────────────
    // STEP 2: process each row, send notifications
    // ────────────────────────────────────────
    for (const row of maps) {
      const { id: mapId, adj_time: adjTime, event } = row;
      
      // Check if event is null or missing critical properties
      if (!event || !event.start_time) {
        console.warn(`⚠️ Skipping map row ${mapId}: Invalid or missing event data`);
        continue;
      }

      const a          = strToTime(adjTime);
      const isExact    = formattedTime === event.start_time;
      const isInterval = (((f.getTime() - a.getTime()) / 1000 / 60) % 5) === 0;

      if (!isExact && !isInterval) continue;

      // load device tokens
      const { data: devices, error: devErr } = await supabase
        .from("user_devices")
        .select("device_token")
        .eq("user_id", event.userid);

      if (devErr) {
        console.error("❌ Error loading devices:", devErr);
        continue;
      }

      // skip if no devices
      if (!devices || devices.length === 0) {
        console.log(`ℹ️ No devices for user ${event.userid}`);
        continue;
      }

      // send FCM to each token
      for (const device of devices) {
        // Skip if no device_token
        if (!device || !device.device_token) {
          console.warn("⚠️ Skipping device with missing token");
          continue;
        }
        
        try {
          await admin.messaging().send({
            token: device.device_token,
            notification: {
              title: "Event Reminder",
              body:  `Upcoming Event: ${event.event_name} at ${event.start_time}`
            },
            data: {
              eventId: String(event.id),
              eventDate: event.event_date,
              eventTime: event.start_time
            }
          });
          console.log(`✅ Sent to ${device.device_token.slice(0,10)}…`);
        } catch (err) {
          console.error(`❌ FCM error for token ${device.device_token.slice(0,10)}…:`, err.message);
        }
      }

      // if exact start, mark as checked
      if (isExact) {
        const { error: updErr } = await supabase
          .from("map")
          .update({ check: true })
          .eq("id", mapId);

        if (updErr) console.error("❌ Failed to mark map.checked:", updErr);
        else console.log(`🗹 Marked map row ${mapId} as checked`);
      }
    }
  } catch (err) {
    console.error("💥 Lambda Error:", err);
  }
};
