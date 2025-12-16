import { create } from "zustand";
import { userAPI } from "../api/user";
import { useAuthStore } from "./authStore";
import type { User } from "../types/user";

interface UserState {
  // State
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;

  // CRUD Actions
  fetchUsers: (filters?: any) => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (data: Partial<User>) => Promise<void>;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  
  // Utility
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>((set, _get) => ({
  // Initial State
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  //  READ - Fetch All Users
  fetchUsers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.getUsers(filters);
      // Backend returns { data: User[], pagination... }
      const users = response.data || response;
      set({ users, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch users", 
        isLoading: false 
      });
      throw error;
    }
  },

  //  READ - Fetch Single User by ID
  fetchUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userAPI.getUserById(id);
      set({ selectedUser: user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch user", 
        isLoading: false 
      });
      throw error;
    }
  },

  //  CREATE - Create New User (using register endpoint)
  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Use register endpoint since there's no POST /users
      const response = await userAPI.register(data as any);
      const newUser = response.user;
      
      // Add to users list
      set((state) => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to create user", 
        isLoading: false 
      });
      throw error;
    }
  },

  //  UPDATE - Update User Data
  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.updateUser(id, data);
      const updatedUser = response.user || response;
      
      // Update users list
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        isLoading: false,
      }));

      // If editing logged-in user → sync with authStore
      const authStore = useAuthStore.getState();
      if (authStore.currentUser?.id === id) {
        await authStore.refreshSession();
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to update user", 
        isLoading: false 
      });
      throw error;
    }
  },

  //  DELETE - Delete User
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userAPI.deleteUser(id);
      
      // Remove from users list
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        isLoading: false,
      }));

      // If deleting logged-in user → logout
      const authStore = useAuthStore.getState();
      if (authStore.currentUser?.id === id) {
        authStore.logout();
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to delete user", 
        isLoading: false 
      });
      throw error;
    }
  },

  //  Set Selected User
  setSelectedUser: (user) => set({ selectedUser: user }),

  //  Clear Error
  clearError: () => set({ error: null }),

  //  Clear All Users Data
  clearUsers: () => set({ users: [], selectedUser: null }),
}));