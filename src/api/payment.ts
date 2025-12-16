import axios from "axios";
import type {
  Payment,
  PaymentCreateInput,
  PaymentUpdateInput,
  FetchPaymentsParams,
} from "../types/payment";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const encodeId = (id: number | string) => btoa(String(id));

export const paymentAPI = {
  // =========================
  // GET /payments
  // =========================
  getAll: async (params?: FetchPaymentsParams) => {
    // ✅ แก้ไข: ใช้ template string ให้ถูกต้อง
    const res = await axios.get(`${BASE_URL}/payments`, {
      params,
      headers: authHeader(),
    });
    return res.data; 
  },

  // =========================
  // GET /payment/:id
  // =========================
  getById: async (id: number): Promise<Payment> => {
    const res = await axios.get(
      `${BASE_URL}/payment/${encodeId(id)}`,
      { headers: authHeader() }
    );
    return res.data.data;
  },

  // =========================
  // POST /payment
  // =========================
  create: async (data: PaymentCreateInput): Promise<Payment> => {
    console.log('💳 Payment API: Creating payment with data:', data);
    
    const res = await axios.post(
      `${BASE_URL}/payment`,
      data,
      { headers: authHeader() }
    );
    
    console.log('💳 Payment API: Response:', res.data);
    
    // ✅ Return payment object
    return res.data.payment || res.data.data || res.data;
  },

  // =========================
  // PUT /payment/:id
  // =========================
  update: async (
    id: number,
    data: PaymentUpdateInput
  ): Promise<Payment> => {
    const res = await axios.put(
      `${BASE_URL}/payment/${encodeId(id)}`,
      data,
      { headers: authHeader() }
    );
    return res.data.payment || res.data.data || res.data;
  },

  // =========================
  // DELETE /payment/:id
  // =========================
  delete: async (id: number): Promise<void> => {
    await axios.delete(
      `${BASE_URL}/payment/${encodeId(id)}`,
      { headers: authHeader() }
    );
  },
};