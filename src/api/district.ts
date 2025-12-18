import axios from "axios";
import type { DistrictAttributes, DistrictCreateInput } from "../../src/types/district";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

export const districtAPI = {
  getAll: async (): Promise<DistrictAttributes[]> => {
    const res = await axios.get(`${BASE_URL}/districts`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  getByProvince: async (provinceId: string): Promise<DistrictAttributes[]> => {
    const res = await axios.get(`${BASE_URL}/districts/province/${provinceId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  create: async (data: DistrictCreateInput): Promise<DistrictAttributes> => {
    const res = await axios.post(`${BASE_URL}/district`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  update: async (id: string, data: Partial<DistrictCreateInput>): Promise<DistrictAttributes> => {
    const res = await axios.put(`${BASE_URL}/district/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/district/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
};
