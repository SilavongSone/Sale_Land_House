import axios from "axios";
import type { LandPlot, LandPlotCreateInput, LandPlotUpdateInput, FetchLandPlotsParams, LandPlotsResponse } from "../../src/types/landPlot";

const BASE_URL = import.meta.env.VITE_API_URL;


const getToken = () => localStorage.getItem("token");

export const landPlotAPI = {
  getAll: async (params?: FetchLandPlotsParams): Promise<LandPlotsResponse> => {
    const res = await axios.get(`${BASE_URL}/landplots`, {
      params,
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  getById: async (id: string): Promise<LandPlot> => {
    const res = await axios.get(`${BASE_URL}/landplot/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  create: async (data: LandPlotCreateInput): Promise<LandPlot> => {
    const res = await axios.post(`${BASE_URL}/landplot`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id: string, data: LandPlotUpdateInput): Promise<LandPlot> => {
    const res = await axios.put(`${BASE_URL}/landplot/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/landplot/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
  },
};
