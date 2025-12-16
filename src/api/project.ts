import axios from "axios";
import type { Project } from "../types/project";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

interface PaginationParams {
  limit?: number;
  page?: number;
  search?: string;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

interface ProjectsResponse {
  data: Project[];
  pagination: {
    total: number;
    page: number;
    skip: number;
    limit: number;
    totalPages: number;
  };
}

export const projectAPI = {
  getAll: async (params?: PaginationParams): Promise<ProjectsResponse> => {
    const res = await axios.get(`${BASE_URL}/projects`, {
      params,
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  getOption: async (): Promise<{ data: Project[] }> => {
    const res = await axios.get(`${BASE_URL}/projects/options`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  getById: async (id: number | string): Promise<Project> => {
    const res = await axios.get(`${BASE_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data; // nested data
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const res = await axios.post(`${BASE_URL}/projects`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data;
  },

  update: async (id: number | string, data: Partial<Project>): Promise<Project> => {
    const res = await axios.put(`${BASE_URL}/projects/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axios.delete(`${BASE_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
};
