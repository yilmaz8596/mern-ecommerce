import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import { connectDB } from "./lib/db.js";

connectDB();
dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/card", cartRoutes);
app.use("/api/v1/coupon", couponRoutes);

app.use((err, req, res, next) => {
  const errMessage = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: errMessage,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
