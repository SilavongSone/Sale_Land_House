import axios from "axios";
import type {
  Staff,
  StaffCreateInput,
  StaffUpdateInput,
  FetchStaffParams,
  StaffResponse,
} from "../../src/types/staff";

const BASE_URL = import.meta.env.VITE_API_URL;


const getToken = () => localStorage.getItem("token");

export const staffAPI = {
  getAll: async (params?: FetchStaffParams): Promise<StaffResponse> => {
    const res = await axios.get(`${BASE_URL}/staffs`, {
      params,
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  getById: async (id: string): Promise<Staff> => {
    const res = await axios.get(`${BASE_URL}/staff/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  create: async (data: StaffCreateInput): Promise<Staff> => {
    const payload: any = {
      ...data,
      basicSalary: String(data.basicSalary),
      commissionRate: data.commissionRate !== undefined ? String(data.commissionRate) : undefined,
    };

    const res = await axios.post(`${BASE_URL}/staff`, payload, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id: string, data: StaffUpdateInput): Promise<Staff> => {
    const payload: any = {
      ...data,
      basicSalary: data.basicSalary !== undefined ? String(data.basicSalary) : undefined,
      commissionRate: data.commissionRate !== undefined ? String(data.commissionRate) : undefined,
    };

    const res = await axios.put(`${BASE_URL}/staff/${id}`, payload, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/staff/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
  },
};
