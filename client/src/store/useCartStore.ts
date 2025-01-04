import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";
import { Cart, Coupon } from "../types";
import { toast } from "react-hot-toast";

interface CartStore {
  cart: Cart[] | null;
  coupon: Coupon | null;
  total: number;
  subtotal: number;
  loading: boolean;
  isCouponApplied: boolean;
  addToCart: (product: Cart) => Promise<void>;
  getMyCoupon: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  getCartItems: () => Promise<void>;
  calculateTotal: () => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeAllFromCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create(
  persist(
    (set, get: () => CartStore) => ({
      cart: [],
      coupon: null,
      total: 0,
      subtotal: 0,
      loading: false,
      isCouponApplied: false,
      getMyCoupon: async () => {
        try {
          const response = await axiosInstance.get("/coupon");
          set({ coupon: response.data });
        } catch (error) {
          console.error("Error fetching coupon:", error);
        }
      },
      applyCoupon: async (code: string) => {
        try {
          const response = await axiosInstance.post("/coupon/validate", {
            code,
          });
          set({ coupon: response.data, isCouponApplied: true });
          get().calculateTotal();
          toast.success("Coupon applied successfully");
        } catch (error: string | any) {
          toast.error(
            error.response?.data?.message || "Failed to apply coupon"
          );
        }
      },
      removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotal();
        toast.success("Coupon removed");
      },
      addToCart: async (product: Cart) => {
        try {
          await axiosInstance.post("/cart", { productId: product._id });
          toast.success("Product added to cart");
          set((prevState) => {
            const existingProduct = prevState.cart
              ? prevState.cart.find((item) => item._id === product._id)
              : null;
            if (existingProduct) {
              return {
                cart: (prevState.cart || []).map((item) =>
                  item._id === product._id
                    ? { ...item, quantity: (item.quantity || 0) + 1 }
                    : item
                ),
              };
            } else {
              return {
                cart: [...(prevState.cart || []), { ...product, quantity: 1 }],
              };
            }
          });
          get().calculateTotal();
        } catch (error: string | any) {
          console.log("error adding to cart", error);
          toast.error("An error occurred", error.response?.data?.message);
        }
      },
      getCartItems: async () => {
        try {
          const { data } = await axiosInstance.get("/cart");
          set({ cart: data.cart });
          get().calculateTotal();
        } catch (error) {
          console.log("error getting cart items", error);
        }
      },
      removeFromCart: async (productId) => {
        try {
          await axiosInstance.delete("/cart", {
            data: { productId },
          });
          set((prevState) => ({
            cart: (prevState.cart || []).filter(
              (item) => item._id !== productId
            ),
          }));
          get().calculateTotal();
        } catch (error: string | any) {
          console.log("error removing from cart", error);
          toast.error("An error occurred", error.response?.data?.message);
        }
      },
      updateQuantity: async (productId, quantity) => {
        if (quantity === 0) {
          get().removeFromCart(productId);
          return;
        }

        await axiosInstance.put(`/cart/${productId}`, { quantity });
        set((prevState) => ({
          cart: (prevState.cart || []).map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        }));
        get().calculateTotal();
      },
      calculateTotal: () => {
        const { cart, coupon } = get();
        const subtotal = cart?.reduce(
          (acc, item) => acc + Number(item.price) * (item.quantity || 0),
          0
        );
        let total = subtotal;
        if (coupon) {
          const discount = Number(subtotal) * (coupon.discountPercentage / 100);
          total = Number(subtotal) - discount;
        }
        set({ subtotal, total });
      },
      removeAllFromCart: async () => {
        try {
          await axiosInstance.delete("/cart");
          set({ cart: [] });
          get().calculateTotal();
        } catch (error: string | any) {
          console.log("error removing all from cart", error);
          toast.error("An error occurred", error.response?.data?.message);
        }
      },
      clearCart: () => {
        set({
          cart: [],
          coupon: null,
          total: 0,
          subtotal: 0,
          isCouponApplied: false,
        });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
