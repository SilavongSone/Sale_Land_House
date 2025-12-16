import axios from "axios";
import type { CurrencyAttributes, CurrencyCreateInput } from "../../src/types/currency";

const BASE_URL = import.meta.env.VITE_API_URL;


const getToken = () => localStorage.getItem("token");

export const currencyAPI = {
  getAll: async (): Promise<CurrencyAttributes[]> => {
    const res = await axios.get(`${BASE_URL}/currencies`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  create: async (data: CurrencyCreateInput): Promise<CurrencyAttributes> => {
    const res = await axios.post(`${BASE_URL}/currency`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id: string, data: Partial<CurrencyCreateInput>): Promise<CurrencyAttributes> => {
    const res = await axios.put(`${BASE_URL}/currency/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/currency/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
  },
};
