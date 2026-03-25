"use client"

import { addDays } from "date-fns"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface UserBanCalendarProps {
  onDateChange?: (date: Date | undefined) => void
  initialDate?: Date | undefined
}

export function UserBanCalendar({
  onDateChange,
  initialDate,
}: UserBanCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const handleDateChange = React.useCallback(
    (nextDate: Date | undefined) => {
      setDate(nextDate)
      onDateChange?.(nextDate)
    },
    [onDateChange],
  )

  return (
    <Card className="mx-auto w-fit max-w-75" size="sm">
      <CardContent>
        <Calendar
          className="p-0 [--cell-size:--spacing(9.5)]"
          fixedWeeks
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          onSelect={handleDateChange}
          selected={date}
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t">
        {[
          { label: "Clear", value: null },
          { label: "1 day", value: 1 },
          { label: "7 days", value: 7 },
          { label: "30 days", value: 30 },
          { label: "60 days", value: 60 },
          { label: "90 days", value: 90 },
        ].map((preset) => (
          <Button
            className="flex-1"
            key={preset.value}
            onClick={() => {
              const newDate =
                preset.value === null
                  ? undefined
                  : addDays(new Date(), preset.value)
              handleDateChange(newDate)
              setCurrentMonth(
                new Date(
                  newDate?.getFullYear() ?? 0,
                  newDate?.getMonth() ?? 0,
                  1,
                ),
              )
            }}
            size="sm"
            variant="outline"
          >
            {preset.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  )
}
