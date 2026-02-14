"use client";

import type { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS, type Category } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ReceiptPreview } from "@/components/receipts/receipt-preview";
import { Pencil, Trash2, Receipt } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const color = CATEGORY_COLORS[expense.category as Category] ?? "#6b7280";

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div
        className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{expense.category}</span>
          <span className="font-semibold">
            {formatCurrency(expense.amount)}
          </span>
        </div>
        {expense.description && (
          <p className="mt-1 text-sm text-muted-foreground truncate">
            {expense.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1">
          {expense.receipt_path && (
            <ReceiptPreview receiptPath={expense.receipt_path} />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(expense)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(expense)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
