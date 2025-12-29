"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mode as visualMode } from "@/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS, MONTHS_SHORT } from "./constants";
import type {
  MonthYearDropdownsProps,
  PresetSelectorProps,
  MonthOnlyGridProps,
  TimePickerProps,
  DatePickerFooterProps,
} from "./types";

export function MonthYearDropdowns({
  month,
  years,
  onMonthChange,
  onYearChange,
}: MonthYearDropdownsProps) {
  return (
    <div className={cn(visualMode.color.border.default, "flex gap-2 border-b p-4")}>
      <Select value={month.getMonth().toString()} onValueChange={onMonthChange}>
        <SelectTrigger className={cn("h-8 flex-1 text-xs", visualMode.radius, visualMode.font)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={visualMode.radius}>
          {MONTHS.map((m, i) => (
            <SelectItem
              key={m}
              value={i.toString()}
              className={cn("text-left text-xs", visualMode.font)}
            >
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={month.getFullYear().toString()} onValueChange={onYearChange}>
        <SelectTrigger className={cn("h-8 w-24 text-xs", visualMode.radius, visualMode.font)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={cn("max-h-60", visualMode.radius)}>
          {years.map((y) => (
            <SelectItem
              key={y}
              value={y.toString()}
              className={cn("text-left text-xs", visualMode.font)}
            >
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PresetSelector({ presets, onPresetSelect }: PresetSelectorProps) {
  return (
    <div className={cn(visualMode.color.border.default, "border-b p-4")}>
      <Select onValueChange={onPresetSelect}>
        <SelectTrigger className={cn("h-8 w-full text-xs", visualMode.radius, visualMode.font)}>
          <SelectValue placeholder="Quick select..." />
        </SelectTrigger>
        <SelectContent className={visualMode.radius}>
          {presets.map((preset) => (
            <SelectItem
              key={preset.label}
              value={preset.label}
              className={cn("text-left text-xs", visualMode.font)}
            >
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function MonthOnlyGrid({
  month,
  onMonthChange,
  onMonthSelect,
  isMonthDisabled,
  isSelectedMonth,
}: MonthOnlyGridProps) {
  return (
    <>
      <div
        className={cn(
          visualMode.color.border.default,
          "flex items-center justify-between border-b p-4"
        )}
      >
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 w-8 p-0", visualMode.radius)}
          onClick={() => onMonthChange(new Date(month.getFullYear() - 1, month.getMonth()))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span className={cn("text-sm font-semibold", visualMode.font)}>{month.getFullYear()}</span>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 w-8 p-0", visualMode.radius)}
          onClick={() => onMonthChange(new Date(month.getFullYear() + 1, month.getMonth()))}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4">
        {MONTHS_SHORT.map((m, index) => (
          <Button
            key={m}
            variant={isSelectedMonth(index) ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-9 text-xs",
              visualMode.radius,
              visualMode.font,
              isSelectedMonth(index) && "bg-primary text-primary-foreground"
            )}
            disabled={isMonthDisabled(index)}
            onClick={() => onMonthSelect(index)}
          >
            {m}
          </Button>
        ))}
      </div>
    </>
  );
}

export function TimePicker({
  hours,
  minutes,
  period,
  use24Hour,
  onHoursChange,
  onMinutesChange,
  onPeriodChange,
  onIncrement,
  onDecrement,
}: TimePickerProps) {
  return (
    <div className="flex items-start justify-center gap-2">
      {/* Hours */}
      <div className="flex flex-col items-center gap-1">
        <span className={cn("text-muted-foreground mb-1 text-xs", visualMode.font)}>[HRS]</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onIncrement.hours}
          className={cn("h-8 w-12 p-0 text-xs", visualMode.radius, visualMode.font)}
        >
          +
        </Button>
        <Input
          type="text"
          value={hours}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            const max = use24Hour ? 23 : 12;
            const min = use24Hour ? 0 : 1;
            if (!isNaN(val) && val >= min && val <= max) {
              onHoursChange(val.toString().padStart(2, "0"));
            }
          }}
          className={cn("h-8 w-12 text-center text-xs", visualMode.radius, visualMode.font)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onDecrement.hours}
          className={cn("h-8 w-12 p-0 text-xs", visualMode.radius, visualMode.font)}
        >
          -
        </Button>
      </div>

      {/* Separator */}
      <span className={cn("mt-6 pt-1 text-xs font-semibold", visualMode.font)}>:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center gap-1">
        <span className={cn("text-muted-foreground mb-1 text-xs", visualMode.font)}>[MIN]</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onIncrement.minutes}
          className={cn("h-8 w-12 p-0 text-xs", visualMode.radius, visualMode.font)}
        >
          +
        </Button>
        <Input
          type="text"
          value={minutes}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 0 && val <= 59) {
              onMinutesChange(val.toString().padStart(2, "0"));
            }
          }}
          className={cn("h-8 w-12 text-center text-xs", visualMode.radius, visualMode.font)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onDecrement.minutes}
          className={cn("h-8 w-12 p-0 text-xs", visualMode.radius, visualMode.font)}
        >
          -
        </Button>
      </div>

      {/* AM/PM Toggle */}
      {!use24Hour && (
        <div className="ml-2 flex flex-col items-center gap-1">
          <span className={cn("text-muted-foreground mb-1 text-xs", visualMode.font)}>
            [PERIOD]
          </span>
          <Button
            variant={period === "AM" ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange("AM")}
            className={cn("h-8 w-12 text-xs", visualMode.radius, visualMode.font)}
          >
            AM
          </Button>
          <Button
            variant={period === "PM" ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange("PM")}
            className={cn("h-8 w-12 text-xs", visualMode.radius, visualMode.font)}
          >
            PM
          </Button>
        </div>
      )}
    </div>
  );
}

export function DatePickerFooter({ showTime, value, onClear, onApply }: DatePickerFooterProps) {
  return (
    <div className={cn(visualMode.color.border.default, "flex gap-2 border-t p-4")}>
      <Button
        variant="outline"
        size="sm"
        className={cn("flex-1 text-xs", visualMode.radius, visualMode.font)}
        onClick={onClear}
      >
        {"> CLEAR"}
      </Button>
      <Button
        size="sm"
        className={cn("flex-1 text-xs", visualMode.radius, visualMode.font)}
        onClick={onApply}
        disabled={showTime && !value}
      >
        {"> APPLY"}
      </Button>
    </div>
  );
}
