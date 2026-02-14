"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormData, type Expense } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ReceiptUpload } from "@/components/receipts/receipt-upload";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  expense?: Expense | null;
  onSubmit: (data: ExpenseFormData, receiptFile?: File | null) => Promise<void>;
}

export function ExpenseForm({
  open,
  onOpenChange,
  date,
  expense,
  onSubmit,
}: ExpenseFormProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!expense;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      date: expense?.date ?? date,
      amount: expense?.amount ?? undefined,
      category: expense?.category ?? undefined,
      description: expense?.description ?? "",
    } as Partial<ExpenseFormData>,
  });

  const onFormSubmit = async (data: ExpenseFormData) => {
    setSubmitting(true);
    await onSubmit(data, receiptFile);
    setSubmitting(false);
    setReceiptFile(null);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "経費を編集" : "経費を追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <input type="hidden" {...register("date")} />

          <div className="space-y-2">
            <Label htmlFor="amount">金額（円）</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリー</Label>
            <Select
              id="category"
              placeholder="カテゴリーを選択"
              defaultValue={expense?.category ?? ""}
              {...register("category")}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">備考</Label>
            <Input
              id="description"
              placeholder="メモ（任意）"
              {...register("description")}
            />
          </div>

          <ReceiptUpload
            existingPath={expense?.receipt_path ?? null}
            onFileSelect={setReceiptFile}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
