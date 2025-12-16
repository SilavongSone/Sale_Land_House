import axios from "axios";
import type {
  CustomerAttributes,
  CustomerCreateInput,
  CustomerQueryParams,
  CustomerResponse,
} from "../../src/types/customer";

const API_URL = import.meta.env.VITE_API_URL;


const getToken = () => localStorage.getItem("token");

export const customerAPI = {
  getAll: async (params?: CustomerQueryParams): Promise<CustomerResponse> => {
    const res = await axios.get(`${API_URL}/customers`, {
      params,
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  getById: async (id: string): Promise<CustomerAttributes> => {
    const res = await axios.get(`${API_URL}/customer/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  create: async (data: CustomerCreateInput): Promise<CustomerAttributes> => {
    const res = await axios.post(`${API_URL}/customer`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id: string, data: Partial<CustomerCreateInput>): Promise<CustomerAttributes> => {
    const res = await axios.put(`${API_URL}/customer/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/customer/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
  },
};
