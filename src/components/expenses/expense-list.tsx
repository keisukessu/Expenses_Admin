"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseCard } from "./expense-card";
import { ExpenseForm } from "./expense-form";
import { ExpenseDeleteDialog } from "./expense-delete-dialog";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Expense, ExpenseFormData } from "@/lib/types";
import { toast } from "sonner";

interface ExpenseListProps {
  date: Date;
  onExpenseChange?: () => void;
}

export function ExpenseList({ date, onExpenseChange }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");
  const supabase = createClient();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("date", dateStr)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("経費の取得に失敗しました");
    } else {
      setExpenses(data as Expense[]);
    }
    setLoading(false);
  }, [dateStr, supabase]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const uploadReceipt = async (
    expenseId: string,
    file: File
  ): Promise<string | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${expenseId}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("receipts")
      .upload(path, file);

    if (error) {
      toast.error("レシート画像のアップロードに失敗しました");
      return null;
    }
    return path;
  };

  const handleAdd = async (data: ExpenseFormData, receiptFile?: File | null) => {
    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        date: data.date,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
      })
      .select()
      .single();

    if (error || !expense) {
      toast.error("経費の追加に失敗しました");
      return;
    }

    let receiptPath: string | null = null;
    if (receiptFile) {
      receiptPath = await uploadReceipt(expense.id, receiptFile);
      if (receiptPath) {
        await supabase
          .from("expenses")
          .update({ receipt_path: receiptPath })
          .eq("id", expense.id);
      }
    }

    toast.success("経費を追加しました");
    fetchExpenses();
    onExpenseChange?.();
  };

  const handleEdit = async (
    data: ExpenseFormData,
    receiptFile?: File | null
  ) => {
    if (!editingExpense) return;

    const updates: Record<string, unknown> = {
      amount: data.amount,
      category: data.category,
      description: data.description || null,
    };

    if (receiptFile) {
      // Delete old receipt if exists
      if (editingExpense.receipt_path) {
        await supabase.storage
          .from("receipts")
          .remove([editingExpense.receipt_path]);
      }
      const path = await uploadReceipt(editingExpense.id, receiptFile);
      if (path) {
        updates.receipt_path = path;
      }
    }

    const { error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", editingExpense.id);

    if (error) {
      toast.error("経費の更新に失敗しました");
      return;
    }

    toast.success("経費を更新しました");
    setEditingExpense(null);
    fetchExpenses();
    onExpenseChange?.();
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;

    if (deletingExpense.receipt_path) {
      await supabase.storage
        .from("receipts")
        .remove([deletingExpense.receipt_path]);
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", deletingExpense.id);

    if (error) {
      toast.error("経費の削除に失敗しました");
      return;
    }

    toast.success("経費を削除しました");
    setDeletingExpense(null);
    fetchExpenses();
    onExpenseChange?.();
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            {format(date, "M月d日（E）", { locale: ja })}
          </h3>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              合計: {formatCurrency(total)}
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          追加
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          読み込み中...
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          この日の経費はありません
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={setEditingExpense}
              onDelete={setDeletingExpense}
            />
          ))}
        </div>
      )}

      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        date={dateStr}
        onSubmit={handleAdd}
      />

      {editingExpense && (
        <ExpenseForm
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingExpense(null);
          }}
          date={dateStr}
          expense={editingExpense}
          onSubmit={handleEdit}
        />
      )}

      {deletingExpense && (
        <ExpenseDeleteDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeletingExpense(null);
          }}
          expense={deletingExpense}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
