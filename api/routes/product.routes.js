import express from "express";
import {
  createProduct,
  getProducts,
  getFeaturedProducts,
  getProductById,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(authMiddleware, adminMiddleware, createProduct);
router.route("/featured").get(getFeaturedProducts);
router.route("/recommended").get(getRecommendedProducts);
router.route("/category/:category").get(getProductsByCategory);
router
  .route("/:id")
  .patch(authMiddleware, adminMiddleware, toggleFeaturedProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(authMiddleware, adminMiddleware, updateProduct)
  .delete(authMiddleware, adminMiddleware, deleteProduct);

export default router;
