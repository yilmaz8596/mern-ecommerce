import { create } from "zustand";
import { Product } from "../types";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

interface ProductStoreState {
  products: Product[];
  loading: boolean;
  fetchAllProducts: () => Promise<void>;
  createProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  toggleFeaturedProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductStoreState>()(
  persist(
    (set) => ({
      products: [],
      loading: false,
      fetchAllProducts: async () => {
        set({ loading: true });
        try {
          const { data } = await axiosInstance.get("/product");
          set({ products: data.products, loading: false });
        } catch {
          set({ loading: false });
        }
      },
      createProduct: async (product: Product) => {
        set({ loading: true });
        try {
          const response = await axiosInstance.post("/product", {
            ...product,
            price: Number(product.price),
          });

          set({ loading: false });
          toast.success("Product created successfully");
        } catch (error: any) {
          console.error("Error:", error.response?.data);
          set({ loading: false });
          toast.error(error.response?.data?.message || "An error occurred");
          throw error;
        }
      },
      deleteProduct: async (id: number) => {
        set({ loading: true });
        try {
          await axiosInstance.delete(`/product/${id}`);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            loading: false,
          }));
          toast.success("Product deleted successfully");
          set({ loading: false });
        } catch {
          set({ loading: false });
          toast.error("An error occurred");
        }
      },
      toggleFeaturedProduct: async (id: number) => {
        set({ loading: true });
        try {
          await axiosInstance.patch(`/product/${id}`);
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, featured: !p.isFeatured } : p
            ),
            loading: false,
          }));
          toast.success("Product updated successfully");
        } catch {
          set({ loading: false });
          toast.error("An error occurred");
        }
      },
    }),
    {
      name: "product-store",
      partialize: (state) => ({ products: state.products }),
    }
  )
);
