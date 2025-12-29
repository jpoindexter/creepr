/**
 * Card Badge Components
 * Badge and label components
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  code?: string;
  label: string;
  meta?: string;
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ code = "0x00", label, meta, className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="badge"
      className={cn(
        "inline-block border px-2 py-1",
        mode.color.border.default,
        mode.color.bg.surface,
        mode.radius,
        className
      )}
      {...props}
    >
      <span className={cn(mode.color.text.muted, mode.typography.caption, mode.font)}>
        [ [{code}] {label} ]{meta ? ` ${meta}` : ""}
      </span>
    </div>
  )
);
Badge.displayName = "Badge";

export type PageBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  prefix?: string;
};

const PageBadge = React.forwardRef<HTMLDivElement, PageBadgeProps>(
  ({ children, prefix = "TEMPLATE", className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="page-badge"
      className={cn(
        "inline-block border px-4 py-1",
        mode.color.bg.surface,
        mode.color.border.default,
        mode.radius,
        className
      )}
      {...props}
    >
      <span className={cn(mode.color.text.muted, mode.typography.caption, mode.font)}>
        [{prefix}]: {children}
      </span>
    </div>
  )
);
PageBadge.displayName = "PageBadge";

export { Badge, PageBadge };
