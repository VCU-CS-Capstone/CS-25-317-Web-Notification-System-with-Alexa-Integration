// Requirements
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
