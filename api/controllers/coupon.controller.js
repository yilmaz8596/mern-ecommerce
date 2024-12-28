import createHttpError from "http-errors";
import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ user: req.user._id, isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json(coupon);
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (coupon.expiryDate < Date.now()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon has expired" });
    }
    res.status(200).json({
      message: "Coupon is valid",
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
    });
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};
