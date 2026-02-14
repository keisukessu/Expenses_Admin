import { z } from "zod";
import { CATEGORIES } from "./constants";

export const expenseSchema = z.object({
  date: z.string().min(1, "日付を選択してください"),
  amount: z.coerce
    .number()
    .int("整数で入力してください")
    .positive("1円以上で入力してください"),
  category: z.enum(CATEGORIES, { message: "カテゴリーを選択してください" }),
  description: z.string().optional(),
});

export type ExpenseFormData = z.output<typeof expenseSchema>;

export type Expense = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  category: (typeof CATEGORIES)[number];
  description: string | null;
  receipt_path: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpensesByDate = Record<string, Expense[]>;
