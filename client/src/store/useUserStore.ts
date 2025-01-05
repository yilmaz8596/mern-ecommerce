import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { User } from "../types";
import { LoginProps, SignupProps } from "../types";
import { persist } from "zustand/middleware";

interface UserStoreState {
  user: User | null;
  loading: boolean;
  checkingAuth: () => Promise<boolean | undefined>;
  setUser: (user: User | null) => void;
  login: ({ email, password }: LoginProps) => Promise<boolean | undefined>;
  signup: ({
    name,
    email,
    password,
    confirmPassword,
  }: SignupProps) => Promise<boolean | undefined>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
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
      checkingAuth: async () => {
        try {
          const { data } = await axiosInstance.get("/auth/profile");
          return !!data.user;
        } catch (error) {
          return false;
        }
      },
      refreshToken: async () => {
        try {
          const { data } = await axiosInstance.post("/auth/refresh-token");

          // With HTTP-only cookies, you typically just update the user state
          if (data.user) {
            set({ user: data.user });
            return true;
          }

          // If no user data, clear the user state
          set({ user: null });
          return false;
        } catch (error: any) {
          console.error("Token refresh failed:", error);
          set({ user: null }); // Clear user on refresh failure
          return false;
        }
      },
    }),
    {
      name: "user-storage", // name of the item in localStorage
      partialize: (state) => ({ user: state.user }), // persist only user data
    }
  )
);

class TokenRefresher {
  private static instance: TokenRefresher;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): TokenRefresher {
    if (!TokenRefresher.instance) {
      TokenRefresher.instance = new TokenRefresher();
    }
    return TokenRefresher.instance;
  }

  async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = useUserStore.getState().refreshToken();

    try {
      const result = await this.refreshPromise;
      return result;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }
}

// Axios interceptor setup
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for unauthorized error and ensure it's not an auth route
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth")
    ) {
      originalRequest._retry = true;

      const tokenRefresher = TokenRefresher.getInstance();
      const refreshed = await tokenRefresher.refreshToken();

      if (refreshed) {
        return axiosInstance(originalRequest);
      }

      // If refresh fails, logout the user
      useUserStore.getState().logout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
