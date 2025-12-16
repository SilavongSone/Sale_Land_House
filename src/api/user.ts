import axios from "axios";
import type { User } from "../types/user";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getToken = () => localStorage.getItem("token");

// axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

export const userAPI = {
  // Get current logged-in user
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get("/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data;
  },

  // Login
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post("/login", credentials);
    return res.data;
  },

  // Register (also used for creating users by admin)
  register: async (userData: Partial<User> & { password: string }) => {
    const res = await api.post("/register", userData);
    return res.data;
  },

  // Get all users with filters
  getUsers: async (params?: PaginationParams) => {
    const res = await api.get("/users", {
      params,
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data; // Returns { data: User[], pagination, orderBy, order }
  },

  // Get users as options (for dropdowns)
  getOptions: async (): Promise<User[]> => {
    const res = await api.get("/users/options", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  // Get user by ID - FIXED: No encoding needed
  getUserById: async (id: number | string): Promise<User> => {
    const res = await api.get(`/user/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data || res.data;
  },

  // Update user - FIXED: No encoding, added currentPassword support
  updateUser: async (
    id: number | string, 
    userData: Partial<User> & { currentPassword?: string }
  ) => {
    const res = await api.put(`/user/${id}`, userData, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data; // Returns { message, user }
  },

  // Delete user - FIXED: No encoding
  deleteUser: async (id: number | string): Promise<void> => {
    await api.delete(`/user/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
};