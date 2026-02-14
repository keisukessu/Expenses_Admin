"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { Expense, ExpensesByDate } from "@/lib/types";
import { toast } from "sonner";

export function useExpenses() {
  const [expensesByDate, setExpensesByDate] = useState<ExpensesByDate>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchMonthExpenses = useCallback(
    async (year: number, month: number) => {
      setLoading(true);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate =
        month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, "0")}-01`;

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", startDate)
        .lt("date", endDate)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("経費の取得に失敗しました");
        setLoading(false);
        return;
      }

      const grouped: ExpensesByDate = {};
      (data as Expense[]).forEach((expense) => {
        if (!grouped[expense.date]) {
          grouped[expense.date] = [];
        }
        grouped[expense.date].push(expense);
      });

      setExpensesByDate(grouped);
      setLoading(false);
    },
    [supabase]
  );

  const addExpense = async (expense: {
    date: string;
    amount: number;
    category: string;
    description?: string;
    receipt_path?: string | null;
  }) => {
    const { data, error } = await supabase
      .from("expenses")
      .insert(expense)
      .select()
      .single();

    if (error) {
      toast.error("経費の追加に失敗しました");
      return null;
    }

    setExpensesByDate((prev) => {
      const dateKey = data.date;
      return {
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), data as Expense],
      };
    });

    toast.success("経費を追加しました");
    return data as Expense;
  };

  const updateExpense = async (
    id: string,
    updates: {
      amount?: number;
      category?: string;
      description?: string;
      receipt_path?: string | null;
    }
  ) => {
    const { data, error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error("経費の更新に失敗しました");
      return null;
    }

    setExpensesByDate((prev) => {
      const updated = { ...prev };
      const dateKey = data.date;
      if (updated[dateKey]) {
        updated[dateKey] = updated[dateKey].map((e) =>
          e.id === id ? (data as Expense) : e
        );
      }
      return updated;
    });

    toast.success("経費を更新しました");
    return data as Expense;
  };

  const deleteExpense = async (expense: Expense) => {
    // Delete receipt from storage if exists
    if (expense.receipt_path) {
      await supabase.storage.from("receipts").remove([expense.receipt_path]);
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id);

    if (error) {
      toast.error("経費の削除に失敗しました");
      return false;
    }

    setExpensesByDate((prev) => {
      const updated = { ...prev };
      const dateKey = expense.date;
      if (updated[dateKey]) {
        updated[dateKey] = updated[dateKey].filter((e) => e.id !== expense.id);
        if (updated[dateKey].length === 0) {
          delete updated[dateKey];
        }
      }
      return updated;
    });

    toast.success("経費を削除しました");
    return true;
  };

  return {
    expensesByDate,
    loading,
    fetchMonthExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
