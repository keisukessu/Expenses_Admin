"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
} from "date-fns";
import { CalendarHeader } from "./calendar-header";
import { CalendarDayCell } from "./calendar-day-cell";
import { WEEKDAY_LABELS } from "@/lib/constants";
import { useExpenses } from "@/hooks/use-expenses";

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

export function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { expensesByDate, loading, fetchMonthExpenses } = useExpenses();

  const loadExpenses = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    fetchMonthExpenses(year, month);
  }, [currentMonth, fetchMonthExpenses]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
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
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
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
              onClick={onDateSelect}
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
  );
}

export { useExpenses };
