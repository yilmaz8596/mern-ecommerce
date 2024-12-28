import createHttpError from "http-errors";
import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, countInStock, imageUrl } =
      req.body;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !countInStock ||
      !imageUrl
    ) {
      return next(new createHttpError.BadRequest("Missing required fields"));
    }
    let cloudinaryResponse = null;
    if (imageUrl) {
      cloudinaryResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      countInStock,
      imageUrl: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
    });
    res.status(201).json({
      product,
      message: "Product created successfully",
    });
  } catch (error) {}
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      products,
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json({
        products: JSON.parse(featuredProducts),
      });
    }

    featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts),
      "EX",
      60
    );

    res.status(200).json({
      featuredProducts,
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const toggleFeaturedProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new createHttpError.NotFound("Product not found"));
    }
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();
    await updateFeaturedProductsCache();
    res.status(200).json({
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new createHttpError.NotFound("Product not found"));
    }
    res.status(200).json({
      product,
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const getRecommendedProducts = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 3 } },
      { $project: { _id: 1, name: 1, description: 1, price: 1, imageUrl: 1 } },
    ]);
    res.status(200).json({
      products,
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json({
      products,
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new createHttpError.NotFound("Product not found"));
    }
    const { name, description, price, category, countInStock, imageUrl } =
      req.body;
    const updatedProduct = Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        countInStock,
        imageUrl,
      },
      { new: true }
    );
    res.status(200).json({
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new createHttpError.NotFound("Product not found"));
    }
    if (product.imageUrl) {
      const publicId = product.imageUrl.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from cloudinary");
      } catch (error) {
        console.log(error);
      }
    }
    await Product.findByIdAndDelete(id);
    res.status(204).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(new createHttpError.InternalServerError());
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log(error);
  }
}
