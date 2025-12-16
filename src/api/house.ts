import axios from "axios";
import type { House, HouseCreateInput, HouseUpdateInput, FetchHousesParams } from "../../src/types/house";

const BASE_URL = import.meta.env.VITE_API_URL;

// 🔐 helper: ดึง token
const getToken = () => localStorage.getItem("token");

export const houseAPI = {
  getAll: async (params?: FetchHousesParams): Promise<House[]> => {
    const res = await axios.get(`${BASE_URL}/houses`, {
      params,
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  getById: async (id: string): Promise<House> => {
    const res = await axios.get(`${BASE_URL}/house/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  create: async (data: HouseCreateInput): Promise<House> => {
    const res = await axios.post(`${BASE_URL}/house`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id: string, data: HouseUpdateInput): Promise<House> => {
    const res = await axios.put(`${BASE_URL}/house/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/house/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
  },
};
