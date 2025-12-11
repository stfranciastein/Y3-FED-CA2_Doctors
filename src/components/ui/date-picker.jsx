import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ value, onChange, placeholder = "Pick a date" }) {
  const [date, setDate] = React.useState(value ? new Date(value) : undefined)

  React.useEffect(() => {
    if (value) {
      setDate(new Date(value))
    }
  }, [value])

  const handleSelect = (selectedDate) => {
    setDate(selectedDate)
    if (selectedDate) {
      // Format as YYYY-MM-DD for the input
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      onChange(formattedDate)
    } else {
      onChange('')
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
