import express from "express";
import {
  getAllEvents,
  AddEvent,
  deleteEvent,
} from "../controller/eventController.js";
const router = express.Router();

router.get("/", getAllEvents);
router.post("/", AddEvent);
router.delete("/:id", deleteEvent);

export default router;
