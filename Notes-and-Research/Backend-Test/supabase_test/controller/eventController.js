import supabase from "../config/supabaseClient.js";

export const getAllEvents = async (req, res) => {
  try {
    const { userid } = req.query;
    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("userid", userid);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const AddEvent = async (req, res) => {
  try {
    const { name, date, start_time, end_time, interval, sessionId } = req.body;

    const true_end = end_time || null;

    const { data, error } = await supabase.from("events").insert([
      {
        event_name: name,
        start_time,
        end_time: true_end,
        event_date: date,
        interval,
        userid: sessionId,
      },
    ]);

    if (error) throw error;

    res.status(201).json({ message: "Event added successfully", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
