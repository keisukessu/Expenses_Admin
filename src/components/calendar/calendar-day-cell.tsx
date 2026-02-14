"use client";

import { format, isToday, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface CalendarDayCellProps {
  date: Date;
  currentMonth: Date;
  isSelected: boolean;
  expenses: Expense[];
  onClick: (date: Date) => void;
}

export function CalendarDayCell({
  date,
  currentMonth,
  isSelected,
  expenses,
  onClick,
}: CalendarDayCellProps) {
  const inCurrentMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dayOfWeek = date.getDay();

  return (
    <button
      className={cn(
        "flex h-16 w-full flex-col items-start rounded-md border p-1 text-left transition-colors hover:bg-accent sm:h-20 sm:p-2",
        !inCurrentMonth && "opacity-30",
        isSelected && "border-primary bg-accent",
        today && !isSelected && "border-primary/50"
      )}
      onClick={() => onClick(date)}
    >
      <span
        className={cn(
          "text-xs font-medium sm:text-sm",
          today && "rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground",
          dayOfWeek === 0 && "text-red-500",
          dayOfWeek === 6 && "text-blue-500",
          today && "text-primary-foreground"
        )}
      >
        {format(date, "d")}
      </span>
      {total > 0 && inCurrentMonth && (
        <span className="mt-auto text-[10px] font-medium text-orange-600 sm:text-xs">
          {formatCurrency(total)}
        </span>
      )}
    </button>
  );
}
