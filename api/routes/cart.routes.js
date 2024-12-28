import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addItemToCart,
  removeAllItemsFromCart,
  getCartProducts,
  updateQuantity,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.route("/").post(authMiddleware, addItemToCart);
router.route("/").delete(authMiddleware, removeAllItemsFromCart);
router.route("/").get(authMiddleware, getCartProducts);
router.route("/:id").put(authMiddleware, updateQuantity);

export default router;
