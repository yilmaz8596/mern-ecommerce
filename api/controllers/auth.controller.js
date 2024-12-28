import User from "../models/user.model.js";
import createHttpError from "http-errors";
import { generateTokens } from "../utils/generateTokens.js";
import { storeRefreshToken } from "../utils/storeRefreshToken.js";
import { setCookies } from "../utils/setCookies.js";
import { redis } from "../lib/redis.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new createHttpError.BadRequest("Missing required fields"));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new createHttpError.Conflict("User already exists"));
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id);
    storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new createHttpError.BadRequest("Missing required fields"));
    }

    const userExists = await User.findOne({ email });
    if (userExists && userExists.matchPassword(password)) {
      const { accessToken, refreshToken } = generateTokens(userExists._id);

      await storeRefreshToken(userExists._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.status(200).json({
        user: {
          _id: userExists._id,
          name: userExists.name,
          email: userExists.email,
          role: userExists.role,
        },
        message: "Logged in successfully",
      });
    }
  } catch (error) {
    next(new createHttpError.InternalServerError());
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new createHttpError.Unauthorized("Not logged in"));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await redis.del(`refreshToken:${decoded.userId}`);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(new createHttpError.InternalServerError());
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new createHttpError.Unauthorized("Not logged in"));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return next(new createHttpError.Unauthorized("Invalid refresh token"));
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Access token generated successfully" });
  } catch (error) {
    next(new createHttpError.InternalServerError());
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    console.log(user);

    if (!user) {
      return next(new createHttpError.NotFound("User not found"));
    }

    res.status(200).json({ user });
  } catch (error) {
    next(new createHttpError.InternalServerError());
  }
};
