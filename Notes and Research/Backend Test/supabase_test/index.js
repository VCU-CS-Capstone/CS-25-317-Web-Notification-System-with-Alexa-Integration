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

//Add new user
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert({username: username, email: email, password: password, role: 'user'}); 
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

//Login user
app.post('/login', async (req, res) => {
  const{ email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('password , id')
    .eq('email', email);
  if (error) return res.status(500).json({ error: error.message });
  const id = data[0]?.id
  if( data[0]?.password == password){
    return res.status(201).json({ id });
  }
  else{
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

//Add new event
app.post('/events', async (req, res) => {
  const { name, date, start_time, end_time, interval, sessionId } = req.body;
  const true_end = end_time ? end_time : null;;
  const { data, error } = await supabase
    .from('events')
    .insert({event_name: name, start_time: start_time, end_time: true_end, event_date: date, interval: interval, userid: sessionId});
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
