"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarDayCell } from "@/components/calendar/calendar-day-cell";
import { ExpenseList } from "@/components/expenses/expense-list";
import { MonthlySummary } from "@/components/layout/monthly-summary";
import { WEEKDAY_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import type { Expense, ExpensesByDate } from "@/lib/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expensesByDate, setExpensesByDate] = useState<ExpensesByDate>({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const supabase = createClient();

  const fetchMonthExpenses = useCallback(async () => {
    setLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
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
  }, [currentMonth, supabase]);

  useEffect(() => {
    fetchMonthExpenses();
  }, [fetchMonthExpenses, refreshKey]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const allMonthExpenses = Object.values(expensesByDate).flat();

  const handleExpenseChange = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <CalendarHeader
            currentMonth={currentMonth}
            onPreviousMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
          />
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`text-center text-xs font-medium py-2 ${
                  i === 0
                    ? "text-red-500"
                    : i === 6
                      ? "text-blue-500"
                      : "text-muted-foreground"
                }`}
              >
                {label}
              </div>
            ))}
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              return (
                <CalendarDayCell
                  key={dateKey}
                  date={day}
                  currentMonth={currentMonth}
                  isSelected={
                    selectedDate !== null &&
                    format(selectedDate, "yyyy-MM-dd") === dateKey
                  }
                  expenses={expensesByDate[dateKey] || []}
                  onClick={setSelectedDate}
                />
              );
            })}
          </div>
          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              読み込み中...
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selectedDate ? (
            <ExpenseList
              key={`${format(selectedDate, "yyyy-MM-dd")}-${refreshKey}`}
              date={selectedDate}
              onExpenseChange={handleExpenseChange}
            />
          ) : (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              <p>日付を選択して</p>
              <p>経費を確認・追加できます</p>
            </div>
          )}
          <MonthlySummary expenses={allMonthExpenses} />
        </div>
      </div>
    </div>
  );
}
