/**
 * Core Card Components
 * Base card shell and content components
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";

export type CardTone = "neutral" | "primary" | "success" | "warning" | "danger";
export type CardSize = "auto" | "full";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
  size?: CardSize;
  interactive?: boolean;
  as?: "div" | "article" | "section";
};

const toneStyles: Record<CardTone, string> = {
  neutral: mode.color.border.default,
  primary: mode.color.border.accent,
  success: mode.color.border.success,
  warning: mode.color.border.warning,
  danger: mode.color.border.danger,
};

const sizeStyles: Record<CardSize, string> = {
  auto: "",
  full: "h-full",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      tone = "neutral",
      size = "full",
      interactive = false,
      as: Component = "div",
      ...props
    },
    ref
  ) => (
    <Component
      ref={ref}
      data-slot="card"
      className={cn(
        "crt-scanlines relative flex flex-col overflow-hidden border",
        mode.color.bg.surface,
        mode.radius,
        toneStyles[tone],
        sizeStyles[size],
        interactive && cn("group transition-colors", mode.state.hover.card),
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// Generate deterministic hex code from string
export function generateHexFromTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  return (
    "0x" +
    Math.abs(hash % 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0")
  );
}

export type CardHeaderProps = {
  code?: string;
  title: string;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
};

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ code, title, icon, meta, className }, ref) => {
    const hexCode = code ?? generateHexFromTitle(title);
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn(
          "flex items-center justify-between border-b px-4 py-2",
          mode.color.border.default,
          "last:border-b-0",
          className
        )}
      >
        <span className={cn(mode.color.text.muted, mode.typography.caption, mode.font)}>
          [{hexCode}] {title}
        </span>
        {(icon || meta) && (
          <span className="flex items-center gap-2">
            {meta && (
              <span className={cn(mode.color.text.muted, mode.typography.caption, mode.font)}>
                {meta}
              </span>
            )}
            {icon}
          </span>
        )}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

export type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: "sm" | "md" | "lg";
};

const paddingStyles = {
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = "md", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("flex-1", paddingStyles[padding], className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 border-t px-4 py-2",
        mode.color.border.default,
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
