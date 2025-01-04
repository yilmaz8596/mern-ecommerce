import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.controller.js";
import createHttpError from "http-errors";

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const analyticsData = await getAnalyticsData();

    // Tarihleri daha güvenli bir şekilde oluştur
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    console.log("Router Dates:", { startDate, endDate }); // Debug için

    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.json({
      success: true,
      analyticsData,
      dailySalesData,
    });
  } catch (error) {
    console.error("Router Error:", error); // Debug için
    next(createHttpError(500, error.message));
  }
});

export default router;
