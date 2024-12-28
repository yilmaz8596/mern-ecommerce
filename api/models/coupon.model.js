import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount is required"],
      min: [0, "Discount cannot be less than 0"],
      max: [100, "Discount cannot be more than 100"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
