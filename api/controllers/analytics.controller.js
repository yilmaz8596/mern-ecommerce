import createHttpError from "http-errors";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const getAnalyticsData = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const { totalSales = 0, totalRevenue = 0 } = salesData[0] || {};

    return {
      // json response yerine data döndür
      users: totalUsers,
      products: totalProducts,
      totalSales,
      totalRevenue,
    };
  } catch (error) {
    throw createHttpError(500, "Error getting analytics");
  }
};

// analytics.controller.js
export const getDailySalesData = async (startDate, endDate) => {
  try {
    // Tarihleri Date objelerine dönüştür
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log("Start:", start, "End:", end); // Debug için

    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log("Sales Data:", dailySalesData); // Debug için

    const dateArray = getDatesInRange(start, end);
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);
      return {
        date,
        totalSales: foundData?.totalSales || 0,
        totalRevenue: foundData?.totalRevenue || 0,
      };
    });
  } catch (error) {
    console.error("Daily Sales Error:", error); // Debug için
    throw new Error("Error getting daily sales data");
  }
};

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};
