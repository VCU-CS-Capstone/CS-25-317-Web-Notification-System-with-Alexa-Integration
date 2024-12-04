//Requirements
const express = require('express');
const cors = require('cors'); 
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 5000;

//Create Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

//Middleware to enable CORS
app.use(cors()); 
app.use(express.json());

//Get all users
app.get('/users', async (req, res) => {

  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get user's events 
app.get('/events', async (req, res) => {
  
  const { userid } = req.query; 
  if (!userid) {
    return res.status(400).json({error: 'Username is required '}); 
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('userid', userid);
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

// Add new user
app.post('/users', async (req, res) => {
  
  const { username, email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert({username: username, email: email, password: password}); 

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

// Login user
app.post('/login', async (req, res) => {
  
  const{ email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('password , id, username')
    .eq('email', email);

  if (error) return res.status(500).json({ error: error.message });

  const user = data[0];

  if( user.password === password){
    return res.status(201).json({id: user.id, username: user.username });
  }
  else{
    return res.status(401).json({ error: 'Unauthorized' });
  }
})

// Add Event 
app.post('/events', async (req, res) => {

  const {event_name, start_time, end_time, event_date, calendar_source, userid} = req.body; 

  try {
    const {data, error } = await supabase
    .from('events')
    .insert([
      { event_name,
      start_time,
      end_time, 
      event_date, 
      calendar_source, 
      userid}
  ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: error.message }); 
  }

  return res.status(201).json({ data }); 
} catch (error) {
  console.error('Unexpected error:', error); 
  return res.status(500).json({ error: 'Unexpected server error'})
}
});

// Delete event 
app.delete('/events/:id', async (req, res) => {
  
  const event_id = req.params.id; 
  try {
    const {data, error} = await supabase
    .from('events')
    .delete()
    .eq('id', event_id);

    if (error) {
      console.error('Supabase error:', error); 
      return res.status(500).json({error: error.message}); 
    }
    res.json({message: `event: ${event_id} deleted`, data});
  } catch (err) {
      console.error('Unexpected error:', err); 
      res.status(500).json({ error: 'An unexpected error has ocurred'});
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
