// types/payment.ts
export interface Payment {
  paymentId: string;
  projectId: string;
  amount: number;
  date: string;
  method: string;
}

export interface PaymentCreateInput {
  projectId: string;
  amount: number;
  date: string;
  method: string;
}

export interface PaymentUpdateInput {
  amount?: number;
  date?: string;
  method?: string;
}

export interface FetchPaymentsParams {
  projectId?: string;
  startDate?: string;
  endDate?: string;
}
