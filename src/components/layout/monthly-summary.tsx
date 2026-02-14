"use client";

import { formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS, type Category } from "@/lib/constants";
import type { Expense } from "@/lib/types";

interface MonthlySummaryProps {
  expenses: Expense[];
}

export function MonthlySummary({ expenses }: MonthlySummaryProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">月間合計</h3>
        <span className="text-lg font-bold">{formatCurrency(total)}</span>
      </div>
      <div className="space-y-2">
        {sorted.map(([category, amount]) => {
          const color =
            CATEGORY_COLORS[category as Category] ?? "#6b7280";
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{category}</span>
                </div>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
