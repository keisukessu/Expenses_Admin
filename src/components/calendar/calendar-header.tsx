"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-xl font-semibold">
        {format(currentMonth, "yyyy年M月", { locale: ja })}
      </h2>
      <Button variant="ghost" size="icon" onClick={onNextMonth}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
