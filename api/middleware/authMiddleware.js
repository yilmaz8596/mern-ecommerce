import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new createHttpError.Unauthorized("User not found"));
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(new createHttpError.Unauthorized("Invalid access token"));
  }
};
