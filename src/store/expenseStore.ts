

import { create } from "zustand";
import type { Expense, ExpenseCreateInput } from "../types/expense";
import { expenseAPI } from "../api/expense";

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  error: string | null;

  fetchExpenses: () => Promise<void>;
  addExpense: (expense: ExpenseCreateInput) => Promise<void>;
  updateExpense: (id: string, expense: Partial<ExpenseCreateInput>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const expenses = await expenseAPI.getAll();
      set({ expenses, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch expenses", loading: false });
    }
  },

  addExpense: async (expense) => {
    set({ loading: true });
    try {
      const newExpense = await expenseAPI.create(expense);
      set((state) => ({ expenses: [...state.expenses, newExpense], loading: false }));
    } catch (err: any) {
      set({ error: err.message || "Failed to add expense", loading: false });
    }
  },

  updateExpense: async (id, expense) => {
    set({ loading: true });
    try {
      const updated = await expenseAPI.update(id, expense);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update expense", loading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true });
    try {
      await expenseAPI.delete(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete expense", loading: false });
    }
  },
}));

export default useExpenseStore;
