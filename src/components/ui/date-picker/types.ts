/**
 * Date Picker Types
 * Type definitions for date picker components
 */

import type { DateRange } from "react-day-picker";

export type DatePickerMode = "single" | "range" | "multiple";

export interface DatePickerProps {
  mode?: DatePickerMode;
  value?: Date;
  rangeValue?: DateRange;
  multipleValue?: Date[];
  onChange?: (date: Date | undefined) => void;
  onRangeChange?: (range: DateRange | undefined) => void;
  onMultipleChange?: (dates: Date[] | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  use24Hour?: boolean;
  showPresets?: boolean;
  presets?: Array<{ label: string; getValue: () => DateRange }>;
  showMonthYearPicker?: boolean;
  monthOnly?: boolean;
  numberOfMonths?: 1 | 2;
  className?: string;
}

export interface MonthYearDropdownsProps {
  month: Date;
  years: number[];
  onMonthChange: (monthIndex: string) => void;
  onYearChange: (year: string) => void;
}

export interface PresetSelectorProps {
  presets: Array<{ label: string; getValue: () => DateRange }>;
  onPresetSelect: (presetLabel: string) => void;
}

export interface MonthOnlyGridProps {
  month: Date;
  value?: Date;
  onMonthChange: (date: Date) => void;
  onMonthSelect: (monthIndex: number) => void;
  isMonthDisabled: (monthIndex: number) => boolean;
  isSelectedMonth: (monthIndex: number) => boolean;
}

export interface TimePickerProps {
  hours: string;
  minutes: string;
  period: "AM" | "PM";
  use24Hour: boolean;
  onHoursChange: (hours: string) => void;
  onMinutesChange: (minutes: string) => void;
  onPeriodChange: (period: "AM" | "PM") => void;
  onIncrement: {
    hours: () => void;
    minutes: () => void;
  };
  onDecrement: {
    hours: () => void;
    minutes: () => void;
  };
}

export interface DatePickerFooterProps {
  mode: DatePickerMode;
  showTime: boolean;
  value?: Date;
  onClear: () => void;
  onApply: () => void;
}
