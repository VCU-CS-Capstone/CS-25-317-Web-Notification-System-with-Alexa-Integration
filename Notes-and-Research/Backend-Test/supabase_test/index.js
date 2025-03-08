// Requirements
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from 'ws';

dotenv.config();
import userRoute from "./routes/userRoute.js";
import eventRoute from "./routes/eventRoute.js";

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware to enable CORS
app.use(cors());
app.use(express.json());

app.use("/users", userRoute);
app.use("/users/events", eventRoute);

// Create a WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send a welcome message
  ws.send(JSON.stringify({ title: 'Welcome', body: 'Connected to notification service' }));

  // Handle messages from clients
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
