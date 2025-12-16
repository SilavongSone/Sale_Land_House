import axios from "axios";
import type { ProvinceAttributes } from "../../src/types/province";

const BASE_URL = import.meta.env.VITE_API_URL;

// 🔐 helper: ดึง token
const getToken = () => localStorage.getItem("token");

export const provinceAPI = {
  getAll: async (): Promise<ProvinceAttributes[]> => {
    const res = await axios.get(`${BASE_URL}/provinces`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  getById: async (id: number): Promise<ProvinceAttributes> => {
    const res = await axios.get(`${BASE_URL}/province/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  create: async (data: Partial<ProvinceAttributes>): Promise<ProvinceAttributes> => {
    const res = await axios.post(`${BASE_URL}/province`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id: number, data: Partial<ProvinceAttributes>): Promise<ProvinceAttributes> => {
    const res = await axios.put(`${BASE_URL}/province/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/province/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
  },
};
