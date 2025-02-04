import express from "express";
import {
  getAllUsers,
  AddUser,
  UserLogin,
  deleteUser,
} from "../controller/userController.js";
const router = express.Router();

router.get("/", getAllUsers);
router.post("/", AddUser);
router.post("/login", UserLogin);
router.delete("/:id", deleteUser);

export default router;
