import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded) {
      return next(new createHttpError.Unauthorized("Invalid access token"));
    }
    req.user = { _id: decoded.userId };
    next();
  } catch (error) {
    console.log(error);
    next(new createHttpError.Unauthorized("Invalid access token"));
  }
};
