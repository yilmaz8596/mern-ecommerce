import { redis } from "../lib/redis.js";
import createHttpError from "http-errors";

export const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 604800);
  } catch (error) {
    throw new createHttpError.InternalServerError(
      "Failed to store refresh token"
    );
  }
};
