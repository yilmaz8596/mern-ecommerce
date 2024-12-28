import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

router.route("/").get(authMiddleware, getCoupon);
router.route("/validate").post(authMiddleware, validateCoupon);

export default router;
