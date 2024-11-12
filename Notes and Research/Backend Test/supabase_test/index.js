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
    .insert({username: username, email: email, password:password}); 
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ data });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
