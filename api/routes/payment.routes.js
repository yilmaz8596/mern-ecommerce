import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createCheckoutSession,
  checkoutSuccess,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.route("/create-checkout-session").post(createCheckoutSession);

router.route("/checkout-success").post(checkoutSuccess);

export default router;
