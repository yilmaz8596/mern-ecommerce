import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";
import { Cart } from "../types";
import { toast } from "react-hot-toast";

interface CartStore {
  cart: Cart[] | null;
  coupon: string | null;
  total: number;
  subtotal: number;
  addToCart: (product: Cart) => Promise<void>;
}

export const useCartStore = create(
  persist(
    (set, get: () => CartStore) => ({
      cart: [],
      coupon: null,
      total: 0,
      subtotal: 0,
      addToCart: async (product: Cart) => {
        const { cart } = get();
        const newCart = [...(cart || []), product];
        set({ cart: newCart });
        try {
          await axiosInstance.post("/cart", { cart: newCart });
          toast.success("Added to cart");
        } catch (error) {
          console.log("error adding to cart", error);
          toast.error("Error adding to cart");
        }
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
