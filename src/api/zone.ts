import axios from "axios";
import type { Zone, ZoneCreateInput, ZoneUpdateInput, FetchZonesParams, ZonesResponse } from "../../src/types/zone";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

export const zoneAPI = {
  getAll: async (params?: FetchZonesParams): Promise<ZonesResponse> => {
    const res = await axios.get<ZonesResponse>(`${BASE_URL}/zones`, {
      params,
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  },

  getById: async (id: string): Promise<Zone> => {
    const res = await axios.get<Zone>(`${BASE_URL}/zone/${id}`, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  },

  create: async (data: ZoneCreateInput): Promise<Zone> => {
    const payload: any = {
      ...data,
      totalLandArea: String(data.totalLandArea),
    };
    if (data.pricePerSqm !== undefined) payload.pricePerSqm = String(data.pricePerSqm);

    const res = await axios.post<Zone>(`${BASE_URL}/zone`, payload, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  },

  update: async (id: string, data: ZoneUpdateInput): Promise<Zone> => {
    const payload: any = {
      ...data,
      totalLandArea: data.totalLandArea !== undefined ? String(data.totalLandArea) : undefined,
    };
    if (data.pricePerSqm !== undefined) payload.pricePerSqm = String(data.pricePerSqm);

    const res = await axios.put<Zone>(`${BASE_URL}/zone/${id}`, payload, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/zone/${id}`, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },
};
