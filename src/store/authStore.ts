// ============================================
// 📁 stores/authStore.ts
// Authentication & Session Management ONLY
// ============================================
import { create } from "zustand";
import { userAPI } from "../api/user";
import type { User } from "../types/user";

interface AuthState {
  // State
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Authentication Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // Permission Helpers
  checkPermission: (permission: "inserts" | "updates" | "deletes" | "cancels") => boolean;
  checkRole: (role: string) => boolean;
  
  // Utility
  clearError: () => void;
}

// localStorage Helper
const storage = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token: string) => localStorage.setItem("token", token),
  removeToken: () => localStorage.removeItem("token"),
  
  getUser: (): User | null => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User) => localStorage.setItem("currentUser", JSON.stringify(user)),
  removeUser: () => localStorage.removeItem("currentUser"),
  
  clear: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  currentUser: storage.getUser(),
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  isLoading: true,
  error: null,

  // 🔐 Initialize Authentication
  initAuth: async () => {
    const token = storage.getToken();
    const cachedUser = storage.getUser();
    
    if (token && cachedUser) {
      // มี token + cache → แสดง UI ทันที
      set({ 
        currentUser: cachedUser,
        token,
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      // Validate token in background
      userAPI.getCurrentUser()
        .then((freshUser) => {
          storage.setUser(freshUser);
          set({ currentUser: freshUser });
        })
        .catch(() => {
          storage.clear();
          set({ 
            currentUser: null, 
            isAuthenticated: false, 
            token: null,
            error: "Session expired"
          });
        });
        
    } else if (token && !cachedUser) {
      // มี token แต่ไม่มี cache
      set({ isLoading: true });
      try {
        const user = await userAPI.getCurrentUser();
        storage.setUser(user);
        set({ 
          currentUser: user, 
          isAuthenticated: true, 
          token, 
          isLoading: false,
          error: null 
        });
      } catch (error) {
        storage.clear();
        set({ 
          currentUser: null, 
          isAuthenticated: false, 
          token: null, 
          isLoading: false
        });
      }
    } else {
      // ไม่มี token
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  // 🔑 Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.login({ email, password });
      
      storage.setToken(response.token);
      storage.setUser(response.user);
      
      set({
        currentUser: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Login failed", 
        isLoading: false 
      });
      throw error;
    }
  },

  //  Register (Create New User Account)
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.register(data);
      
      storage.setToken(response.token);
      storage.setUser(response.user);
      
      set({
        currentUser: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Registration failed", 
        isLoading: false 
      });
      throw error;
    }
  },

  // 🚪 Logout
  logout: () => {
    storage.clear();
    set({ 
      currentUser: null, 
      token: null, 
      isAuthenticated: false, 
      error: null 
    });
  },

  // 🔄 Refresh Session
  refreshSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await userAPI.getCurrentUser();
      storage.setUser(user);
      set({ 
        currentUser: user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      storage.clear();
      set({ 
        currentUser: null,
        isAuthenticated: false,
        token: null,
        isLoading: false,
        error: "Session expired"
      });
    }
  },

  //  Check Permission
  checkPermission: (permission) => {
    const user = get().currentUser;
    return user ? user[permission] === 1 : false;
  },

  // Check Role
  checkRole: (role) => {
    const user = get().currentUser;
    return user ? user.role === role : false;
  },

  //  Clear Error
  clearError: () => set({ error: null }),
}));