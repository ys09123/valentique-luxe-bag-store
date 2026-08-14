import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

import { getRedisClient } from "../config/redis.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// OTP authentication (public)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected routes (require authentication)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.get("/redis-test", async (req, res) => {
  try {
    const redis = await getRedisClient();
    await redis.set("test", "hello", { EX: 60 });
    const value = await redis.get("test");
    res.status(200).json({ value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
