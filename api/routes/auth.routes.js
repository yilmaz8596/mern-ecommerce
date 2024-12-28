import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", authMiddleware, getProfile);

export default router;
