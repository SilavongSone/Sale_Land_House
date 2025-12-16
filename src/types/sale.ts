// src/types/sale.ts

export interface Sale {
  data: any;
  sale: any;
  id: number;
  saleCode: string;
  
  propertyType: "LAND" | "HOUSE" | "OTHER";
  zoneId: number;
  landPlotId: number | null;
  houseId: number | null;
  
  customerId: number;
  sellerId: number;
  
  price: number;
  totalPrice: number;
  discountAmount: number;
  
  downPayment: number;
  installmentMonths: number;
  monthlyPayment: number;
  interestRate: number;
  
  // totalPaid: number;
  // remainingBalance: number;
  
  saleDate: string | Date;
  contractDate: string | Date | null;
  contractNumber: string | null;
  
  currencyId: number;
  exchangeRate: number;
  
  saleStatus: "DRAFT" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "OVERDUE";
  
  notes: string | null;
  
  // Relations
  zone?: {
    id: number;
    zoneName: string;
    zoneCode: string;
  };
  
  landPlot?: {
    id: number;
    plotNumber: string;
    plotCode: string;
    area: number;
  };
  
  house?: {
    id: number;
    houseNumber: string;
    houseCode: string;
  };
  
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  
  seller?: {
    id: number;
    firstName: string;
    lastName: string;
    staffCode: string;
  };
  
  currency?: {
    id: number;
    currencyCode: string;
    currencyName: string;
    symbol: string;
  };
  
  payments?: Payment[];
  
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Payment {
  id: number;
  saleId: number;
  paymentDate: string | Date;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
}

export interface SaleFormData {
  saleCode: string;
  propertyType: "LAND" | "HOUSE" | "OTHER";
  zoneId: number | null | undefined;
  landPlotId: number | null;
  houseId: number | null;
  customerId: number | null;
  sellerId: number | null;
  price: number;
  totalPrice: number;
  discountAmount: number;
  downPayment: number;
  installmentMonths: number;
  monthlyPayment: number;
  interestRate: number;
  saleDate: string | Date;
  contractDate: string | Date | null;
  contractNumber: string | null;
  currencyId: number | null;
  exchangeRate: number;
  saleStatus: "DRAFT" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "OVERDUE";
  notes: string | null;
}

export interface SaleFilters {
  zoneId?: number;
  landPlotId?: number;
  houseId?: number;
  customerId?: number;
  sellerId?: number;
  currencyId?: number;
  propertyType?: "LAND" | "HOUSE" | "OTHER";
  saleStatus?: "DRAFT" | "CONFIRMED" | "CANCELLED";
  paymentStatus?: "PENDING" | "PAID" | "OVERDUE";
}