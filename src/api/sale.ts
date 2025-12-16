import axios from "axios";
import type { Sale, SaleFilters } from "../../src/types/sale";

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

export const saleAPI = {
  getAll: async (filters?: Partial<SaleFilters>): Promise<Sale[]> => {
    const query = filters ? `?${new URLSearchParams(filters as any).toString()}` : "";
    const res = await axios.get(`${BASE_URL}/sales${query}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  getById: async (id: string): Promise<Sale> => {
    const res = await axios.get(`${BASE_URL}/sales/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  create: async (saleData: Partial<Sale>): Promise<Sale> => {
    const res = await axios.post(`${BASE_URL}/sales`, saleData, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id: string, saleData: Partial<Sale>): Promise<Sale> => {
    const res = await axios.put(`${BASE_URL}/sales/${id}`, saleData, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/sales/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
  },
};
