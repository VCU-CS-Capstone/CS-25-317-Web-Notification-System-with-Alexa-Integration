import express from "express";
import {
  getAllEvents,
  AddEvent,
  deleteEvent,
  editEvent,
} from "../controller/eventController.js";
const router = express.Router();

router.get("/", getAllEvents);
router.post("/", AddEvent);
router.delete("/:id", deleteEvent);
router.put("/:id", editEvent);

export default router;
