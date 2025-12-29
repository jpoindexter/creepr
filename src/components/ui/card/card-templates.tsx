/**
 * Card Template Components
 * Template page header and layout components
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { PageBadge } from "./card-badges";

export type TemplatePageHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  badge: string;
  title: string;
  description?: string;
  badgePrefix?: string;
};

const TemplatePageHeader = React.forwardRef<HTMLDivElement, TemplatePageHeaderProps>(
  ({ badge, title, description, badgePrefix = "TEMPLATE", className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="template-page-header"
      className={cn("space-y-2", className)}
      {...props}
    >
      <PageBadge prefix={badgePrefix}>{badge}</PageBadge>
      <h1 className={cn("text-4xl font-semibold tracking-tight", mode.font)}>{title}</h1>
      {description && (
        <p className={cn(mode.color.text.muted, mode.typography.body.sm, mode.font)}>
          {description}
        </p>
      )}
    </div>
  )
);
TemplatePageHeader.displayName = "TemplatePageHeader";

export { TemplatePageHeader };
