import axios from "axios";
import type { Expense, ExpenseCreateInput } from "../../src/types/expense";

const BASE_URL = import.meta.env.VITE_API_URL;

// 🔐 helper: ดึง token
const getToken = () => localStorage.getItem("token");

export const expenseAPI = {
  getAll: async (): Promise<Expense[]> => {
    const res = await axios.get(`${BASE_URL}/expenses`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  getByProject: async (projectId: string): Promise<Expense[]> => {
    const res = await axios.get(`${BASE_URL}/expenses/project/${projectId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  create: async (data: ExpenseCreateInput): Promise<Expense> => {
    const payload = { ...data, amount: Number(data.amount) };
    const res = await axios.post(`${BASE_URL}/expense`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  update: async (id: string, data: Partial<ExpenseCreateInput>): Promise<Expense> => {
    const res = await axios.put(`${BASE_URL}/expense/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/expense/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
};
