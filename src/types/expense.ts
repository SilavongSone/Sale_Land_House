export type ExpenseCategory = "LAND_PURCHASE" | "CONSTRUCTION" | "MARKETING" | "LEGAL" | "OTHER";

export interface Expense {
  id: string;
  projectId: string;
  expenseCode: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  vendor?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  project?: { id: string; projectName: string };
}

export interface ExpenseCreateInput {
  projectId: string;
  expenseCode: string;
  category: ExpenseCategory;
  description: string;
  amount: string; // รับจาก input form
  expenseDate: string;
  vendor?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
}
