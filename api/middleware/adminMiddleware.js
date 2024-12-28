import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return next(
        new createHttpError.Forbidden("Not authorized to access this route")
      );
    }
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new createHttpError.Unauthorized("Invalid access token"));
    }
    next(new createHttpError.InternalServerError());
  }
};
