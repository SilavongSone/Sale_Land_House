// src/types/currency.ts

export type CurrencyStatus = "ACTIVE" | "INACTIVE";

export interface CurrencyAttributes {
  currencyId: string | number;
  currencyName: string;
  symbol: string;
  exchangeRate: number;
  isDefault?: boolean;
  status?: CurrencyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencyCreateInput {
  currencyName: string;
  symbol: string;
  exchangeRate: number | string; // รองรับ input form
  isDefault?: boolean;
  status?: CurrencyStatus;
}

export interface CurrencyUpdateInput extends Partial<CurrencyCreateInput> {}

// // Helper functions
// export const getCurrencyId = (currency: CurrencyAttributes): string | number => {
//   return currency.currencyId;
// };

// export const getCurrencyCode = (currency: CurrencyAttributes): string => {
//   return currency.symbol || 'N/A';
// };

// export const getCurrencyName = (currency: CurrencyAttributes): string => {
//   return currency.currencyName || 'Unknown';
// };