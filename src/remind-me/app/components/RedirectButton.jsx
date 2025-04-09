// Logic for Google API - doesn't work with redirect yet

// need to add getting user data from google sign in to 

// Redirect URI section goes here
// change public data accordingly - when it uses the public google calendar

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Google Calendar API setup
const API_KEY = 'AIzaSyB5XM8GhgSidBykexg-G4nlwqNdKSm6EK4';  // Google API Key
const calendar = google.calendar({ version: 'v3', auth: API_KEY });

// Supabase setup
const supabaseUrl = 'https://ialcoyyfwycdaldjdpyo.supabase.co';  
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbGNveXlmd3ljZGFsZGpkcHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTExNjksImV4cCI6MjA0NjU4NzE2OX0.YLERwCV9-YqBquazVPjXwiLM_acNLN-pkg92Mr23Sos';  
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch events from Google Calendar (Public) - change for once gotten google tokens
async function fetchEventsFromGoogleCalendar() {
  const calendarId = 'https://calendar.google.com/calendar/embed?src=f511c6f99584c49e14b7ae2ae8f947b4ae65e3713c5ff7c60c50f022f4756f22%40group.calendar.google.com&ctz=America%2FNew_York';  // Public calendar needs to be changed
  const timeMin = new Date().toISOString(); // Current time in ISO format
  const timeMax = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(); // Fetch events for the next year - change to only the next few events

  try {
    const res = await calendar.events.list({
      calendarId: calendarId,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,  // Ensure single events (not recurring) are fetched
      orderBy: 'startTime', // Sort by start time
    });

    return res.data.items;  // Returns an array of events
  } catch (error) {
    console.error('Error fetching events from Google Calendar:', error);
    return [];
  }
}

// Function to extract date and time from a timestamp string
function splitDateTime(timestamp) {
  const dateTime = new Date(timestamp);  // Convert timestamp string to Date object
  const date = dateTime.toISOString().split('T')[0];  // Extract the date part (YYYY-MM-DD)
  const time = dateTime.toISOString().split('T')[1].split('Z')[0];  // Extract the time part (HH:mm:ss)
  return { date, time };
}

// Insert event data into Supabase
async function insertEventToSupabase(event) {
  // Extract date and time for start and end times
  const { date: startDate, time: startTime } = splitDateTime(event.start.dateTime);
  const { date: endDate, time: endTime } = splitDateTime(event.end.dateTime);

  const { data, error } = await supabase // got rid of "start_date & end_time" into event_date
    .from('events')  // Replace with your table name
    .insert([
      {
        // need to id to be changed into an int or to add a new column for "google_id"
        id: event.id,               // Event ID from Google Calendar
        event_name: event.summary,        // Event title
        event_date: startDate,            // Date part of start time
        start_time: startTime,            // Time part of start time
        end_time: endTime,                // Time part of end time
        // got rid of description because it does not exist in database - can be added to the database
      },
    ]);

  if (error) {
    console.error('Error inserting event into Supabase:', error);
  } else {
    console.log('Event inserted into Supabase:', data);
  }
}

// Sync events to Supabase
async function syncEventsToSupabase() {
  const events = await fetchEventsFromGoogleCalendar();

  if (events.length > 0) {
    for (const event of events) {
      // Insert each event into Supabase
      await insertEventToSupabase(event);
      console.log(`Event ID ${event.id} has been inserted into Supabase.`);
    }
  } else {
    console.log('No events found in the public calendar.');
  }
}

// Call the function to sync events
syncEventsToSupabase();