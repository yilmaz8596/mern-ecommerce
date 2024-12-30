import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { User } from "../types";
import { LoginProps, SignupProps } from "../types";
import { persist } from "zustand/middleware";

interface UserStoreState {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  setUser: (user: User | null) => void;
  login: ({ email, password }: LoginProps) => Promise<boolean | undefined>;
  signup: ({
    name,
    email,
    password,
    confirmPassword,
  }: SignupProps) => Promise<boolean | undefined>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      checkingAuth: true,
      setUser: (user) => set({ user }),
      login: async ({ email, password }: LoginProps) => {
        set({ loading: true });
        try {
          const { data } = await axiosInstance.post("/auth/login", {
            email,
            password,
          });

          if (data) {
            set({ user: data.user, loading: false });
            toast.success("Logged in successfully");
            return true;
          }
          set({ loading: false });
        } catch (error: string | any) {
          set({ loading: false });
          toast.error(error.response.data.message || "An error occurred");
          return false;
        }
      },
      signup: async ({ name, email, password }: SignupProps) => {
        try {
          set({ loading: true });
          const { data } = await axiosInstance.post("/auth/register", {
            name,
            email,
            password,
          });
          console.log(data);

          if (data.user) {
            set({ loading: false });
            toast.success("Account created successfully");
            return true;
          }
        } catch (error: string | any) {
          set({ loading: false });
          toast.error(error.response.data.message || "An error occurred");
          return false;
        }
      },
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ user: null });
          toast.success("Logged out successfully");
        } catch (error: string | any) {
          toast.error(error.response.data.message || "An error occurred");
        }
      },
    }),
    {
      name: "user-storage", // name of the item in localStorage
      partialize: (state) => ({ user: state.user }), // persist only user data
    }
  )
);
