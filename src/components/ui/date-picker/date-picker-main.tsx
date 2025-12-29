"use client";

import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { mode as visualMode } from "@/design-system";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DEFAULT_PRESETS } from "./constants";
import type { DatePickerProps } from "./types";
import {
  MonthYearDropdowns,
  PresetSelector,
  MonthOnlyGrid,
  TimePicker,
  DatePickerFooter,
} from "./subcomponents";

function DatePicker({
  mode = "single",
  value,
  rangeValue,
  multipleValue,
  onChange,
  onRangeChange,
  onMultipleChange,
  placeholder,
  disabled = false,
  minDate,
  maxDate,
  showTime = false,
  use24Hour = false,
  showPresets = false,
  presets = DEFAULT_PRESETS,
  showMonthYearPicker = false,
  monthOnly = false,
  numberOfMonths = 1,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonthState] = React.useState<Date>(value || rangeValue?.from || new Date());

  // Time state (for showTime mode)
  const [hours, setHours] = React.useState<string>(
    value ? format(value, use24Hour ? "HH" : "hh") : "12"
  );
  const [minutes, setMinutes] = React.useState<string>(value ? format(value, "mm") : "00");
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    value && !use24Hour ? (format(value, "a").toUpperCase() as "AM" | "PM") : "AM"
  );

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const minYear = minDate?.getFullYear() || currentYear - 50;
    const maxYear = maxDate?.getFullYear() || currentYear + 50;
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  }, [minDate, maxDate, currentYear]);

  // Get placeholder text
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (monthOnly) return "Pick a month";
    if (mode === "range") return "Pick a date range";
    if (showTime) return "Pick date and time";
    return "Pick a date";
  };

  // Format display value
  const getDisplayValue = () => {
    if (monthOnly && value) {
      return format(value, "MMMM yyyy");
    }
    if (mode === "single" && value) {
      if (showTime) {
        return format(value, use24Hour ? "PPP HH:mm" : "PPP hh:mm a");
      }
      return format(value, "PPP");
    }
    if (mode === "range" && rangeValue?.from) {
      if (rangeValue.to) {
        return `${format(rangeValue.from, "LLL dd, y")} - ${format(rangeValue.to, "LLL dd, y")}`;
      }
      return format(rangeValue.from, "LLL dd, y");
    }
    if (mode === "multiple" && multipleValue?.length) {
      return `${multipleValue.length} dates selected`;
    }
    return null;
  };

  // Handle single date select
  const handleSingleSelect = (date: Date | undefined) => {
    if (showTime && date) {
      setMonthState(date);
    } else {
      onChange?.(date);
      if (date) setOpen(false);
    }
  };

  // Handle time apply
  const handleTimeApply = () => {
    if (!month) return;

    const newDateTime = new Date(month);
    let hoursValue = parseInt(hours);

    if (!use24Hour) {
      if (period === "PM" && hoursValue !== 12) {
        hoursValue += 12;
      } else if (period === "AM" && hoursValue === 12) {
        hoursValue = 0;
      }
    }

    newDateTime.setHours(hoursValue);
    newDateTime.setMinutes(parseInt(minutes));
    newDateTime.setSeconds(0);

    onChange?.(newDateTime);
    setOpen(false);
  };

  // Handle range select
  const handleRangeSelect = (range: DateRange | undefined) => {
    onRangeChange?.(range);
  };

  // Handle preset select
  const handlePresetSelect = (presetLabel: string) => {
    const preset = presets.find((p) => p.label === presetLabel);
    if (preset) {
      onRangeChange?.(preset.getValue());
    }
  };

  // Handle month select (monthOnly mode)
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(setYear(new Date(), month.getFullYear()), monthIndex);
    onChange?.(newDate);
    setOpen(false);
  };

  // Handle month/year dropdown changes
  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(month);
    newDate.setMonth(parseInt(monthIndex));
    setMonthState(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonthState(newDate);
  };

  // Time increment/decrement
  const incrementHours = () => {
    const maxHours = use24Hour ? 23 : 12;
    const minHours = use24Hour ? 0 : 1;
    const newHours = parseInt(hours) + 1;
    setHours((newHours > maxHours ? minHours : newHours).toString().padStart(2, "0"));
  };

  const decrementHours = () => {
    const maxHours = use24Hour ? 23 : 12;
    const minHours = use24Hour ? 0 : 1;
    const newHours = parseInt(hours) - 1;
    setHours((newHours < minHours ? maxHours : newHours).toString().padStart(2, "0"));
  };

  const incrementMinutes = () => {
    const newMinutes = parseInt(minutes) + 1;
    if (newMinutes > 59) {
      setMinutes("00");
      incrementHours();
    } else {
      setMinutes(newMinutes.toString().padStart(2, "0"));
    }
  };

  const decrementMinutes = () => {
    const newMinutes = parseInt(minutes) - 1;
    if (newMinutes < 0) {
      setMinutes("59");
      decrementHours();
    } else {
      setMinutes(newMinutes.toString().padStart(2, "0"));
    }
  };

  // Check if month is disabled (monthOnly mode)
  const isMonthDisabled = (monthIndex: number) => {
    const date = setMonth(setYear(new Date(), month.getFullYear()), monthIndex);
    if (minDate && date < setMonth(minDate, minDate.getMonth())) return true;
    if (maxDate && date > setMonth(maxDate, maxDate.getMonth())) return true;
    return false;
  };

  const isSelectedMonth = (monthIndex: number) => {
    if (!value) return false;
    return value.getMonth() === monthIndex && value.getFullYear() === month.getFullYear();
  };

  const displayValue = getDisplayValue();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left text-xs",
            visualMode.radius,
            visualMode.font,
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          {displayValue || <span>{getPlaceholder()}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("w-auto p-0", visualMode.radius)} align="start">
        {/* Month/Year Dropdowns */}
        {showMonthYearPicker && !monthOnly && (
          <MonthYearDropdowns
            month={month}
            years={years}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />
        )}

        {/* Presets (range mode) */}
        {mode === "range" && showPresets && (
          <PresetSelector presets={presets} onPresetSelect={handlePresetSelect} />
        )}

        {/* Month-Only Picker */}
        {monthOnly ? (
          <MonthOnlyGrid
            month={month}
            value={value}
            onMonthChange={setMonthState}
            onMonthSelect={handleMonthSelect}
            isMonthDisabled={isMonthDisabled}
            isSelectedMonth={isSelectedMonth}
          />
        ) : showTime && mode === "single" ? (
          /* Date + Time Picker */
          <Tabs defaultValue="date" className="w-full">
            <TabsList
              className={cn(
                visualMode.color.border.default,
                "bg-muted/50 w-full border-b",
                visualMode.radius
              )}
            >
              <TabsTrigger
                value="date"
                className={cn("flex-1 text-xs", visualMode.radius, visualMode.font)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                DATE
              </TabsTrigger>
              <TabsTrigger
                value="time"
                className={cn("flex-1 text-xs", visualMode.radius, visualMode.font)}
              >
                <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                TIME
              </TabsTrigger>
            </TabsList>

            <TabsContent value="date" className="m-0 p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => {
                  if (date) setMonthState(date);
                  onChange?.(date);
                }}
                month={month}
                onMonthChange={setMonthState}
                hideNavigation={showMonthYearPicker}
                disabled={(d) => {
                  if (minDate && d < minDate) return true;
                  if (maxDate && d > maxDate) return true;
                  return false;
                }}
                initialFocus
              />
            </TabsContent>

            <TabsContent value="time" className="m-0 p-4">
              <TimePicker
                hours={hours}
                minutes={minutes}
                period={period}
                use24Hour={use24Hour}
                onHoursChange={setHours}
                onMinutesChange={setMinutes}
                onPeriodChange={setPeriod}
                onIncrement={{ hours: incrementHours, minutes: incrementMinutes }}
                onDecrement={{ hours: decrementHours, minutes: decrementMinutes }}
              />
            </TabsContent>
          </Tabs>
        ) : mode === "range" ? (
          /* Range Calendar */
          <Calendar
            mode="range"
            selected={rangeValue}
            onSelect={handleRangeSelect}
            numberOfMonths={numberOfMonths}
            defaultMonth={rangeValue?.from}
            disabled={(d) => {
              if (minDate && d < minDate) return true;
              if (maxDate && d > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        ) : mode === "multiple" ? (
          /* Multiple Calendar */
          <Calendar
            mode="multiple"
            selected={multipleValue}
            onSelect={(dates) => onMultipleChange?.(dates)}
            month={month}
            onMonthChange={setMonthState}
            hideNavigation={showMonthYearPicker}
            disabled={(d) => {
              if (minDate && d < minDate) return true;
              if (maxDate && d > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        ) : (
          /* Single Calendar */
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSingleSelect}
            month={month}
            onMonthChange={setMonthState}
            hideNavigation={showMonthYearPicker}
            disabled={(d) => {
              if (minDate && d < minDate) return true;
              if (maxDate && d > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        )}

        {/* Footer Actions */}
        {(showTime || mode === "range") && !monthOnly && (
          <DatePickerFooter
            mode={mode}
            showTime={showTime}
            value={value}
            onClear={() => {
              if (mode === "range") {
                onRangeChange?.(undefined);
              } else {
                onChange?.(undefined);
              }
            }}
            onApply={showTime ? handleTimeApply : () => setOpen(false)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";

export { DatePicker };
