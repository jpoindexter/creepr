/**
 * Card Stats Components
 * Stat display components for cards
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";

export type StatProps = React.HTMLAttributes<HTMLSpanElement> & {
  label: string;
  value: string | number;
  size?: "sm" | "md";
};

const Stat = React.forwardRef<HTMLSpanElement, StatProps>(
  ({ label, value, size = "md", className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="stat"
      className={cn(size === "sm" ? "text-xs" : "text-sm", className)}
      {...props}
    >
      <span className={cn(mode.color.text.muted, mode.font)}>{label}:</span>{" "}
      <span className={cn(mode.color.text.accent, mode.font)}>{value}</span>
    </span>
  )
);
Stat.displayName = "Stat";

export type StatGroupProps = React.HTMLAttributes<HTMLDivElement>;

const StatGroup = React.forwardRef<HTMLDivElement, StatGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="stat-group"
      className={cn("flex flex-wrap gap-4", className)}
      {...props}
    />
  )
);
StatGroup.displayName = "StatGroup";

export { Stat, StatGroup };
