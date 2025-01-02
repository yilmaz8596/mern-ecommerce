import createHttpError from "http-errors";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const addItemToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingItem = await user.cartItems.find(
      (item) => item.product == productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId });
    }

    await user.save();
    res.status(200).json({
      message: "Item added to cart",
      cartItems: {
        cartItems: user.cartItems,
      },
    });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const removeAllItemsFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (productId) {
      user.cartItems = user.cartItems.filter((item) => item.id != productId);
    } else {
      user.cartItems = [];
    }
    await user.save();
    res.json({
      cartItems: user.cartItems,
    });
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = await user.cartItems.find(
      (item) => item.product == productId
    );
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product != productId
        );
        await user.save();
        res.json({
          cartItems: user.cartItems,
        });
      }
      existingItem.quantity = quantity;
      await user.save();
      res.json({
        cartItems: user.cartItems,
      });
    } else {
      return next(createHttpError(404, "Item not found in cart"));
    }
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const getCartProducts = async (req, res, next) => {
  try {
    const user = req.user;
    const products = await Product.find({ _id: { $in: user.cartItems } });

    const cartItems = products.map((product) => {
      const item = user.cartItems.find((item) => item.id == product.id);
      return {
        ...product.toJSON(),
        quantity: item.quantity,
      };
    });
    res.json({
      cartItems,
    });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};
