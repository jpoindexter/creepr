/**
 * Card Feature Components
 * Feature list and styled label components
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { Card, CardHeader, CardContent } from "./card-core";

export type StyledLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  showColon?: boolean;
};

const StyledLabel = React.forwardRef<HTMLDivElement, StyledLabelProps>(
  ({ children, showColon = true, className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="styled-label"
      className={cn(mode.color.text.muted, mode.typography.caption, mode.font, className)}
      {...props}
    >
      [{children}]{showColon ? ":" : ""}
    </div>
  )
);
StyledLabel.displayName = "StyledLabel";

export type FeatureItemProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  icon?: "arrow" | "check" | "dot";
};

const FeatureItem = React.forwardRef<HTMLDivElement, FeatureItemProps>(
  ({ children, icon = "arrow", className, ...props }, ref) => {
    const iconMap = {
      arrow: ">",
      check: "\u2713",
      dot: "\u2022",
    };

    return (
      <div
        ref={ref}
        data-slot="feature-item"
        className={cn(mode.typography.caption, mode.font, className)}
        {...props}
      >
        <span className={mode.color.text.success}>{iconMap[icon]}</span> {children}
      </div>
    );
  }
);
FeatureItem.displayName = "FeatureItem";

export type FeatureListProps = React.HTMLAttributes<HTMLDivElement>;

const FeatureList = React.forwardRef<HTMLDivElement, FeatureListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="feature-list"
      className={cn("space-y-2", mode.typography.caption, mode.font, className)}
      {...props}
    >
      {children}
    </div>
  )
);
FeatureList.displayName = "FeatureList";

export type InfoNoteProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  label?: string;
};

const InfoNote = React.forwardRef<HTMLDivElement, InfoNoteProps>(
  ({ children, label = "NOTE", className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="info-note"
      className={cn(mode.color.text.muted, "mt-4", mode.typography.caption, mode.font, className)}
      {...props}
    >
      [{label}]: {children}
    </div>
  )
);
InfoNote.displayName = "InfoNote";

export type FeaturesCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  code?: string;
  features: string[];
  note?: string;
  featureIcon?: "arrow" | "check" | "dot";
};

const FeaturesCard = React.forwardRef<HTMLDivElement, FeaturesCardProps>(
  (
    {
      title = "TEMPLATE FEATURES",
      code = "0x00",
      features,
      note,
      featureIcon = "arrow",
      className,
      ...props
    },
    ref
  ) => (
    <Card ref={ref} className={className} {...props}>
      <CardHeader code={code} title={title} />
      <CardContent>
        <StyledLabel className="mb-4">{title}</StyledLabel>
        <FeatureList>
          {features.map((feature, index) => (
            <FeatureItem key={index} icon={featureIcon}>
              {feature}
            </FeatureItem>
          ))}
        </FeatureList>
        {note && <InfoNote>{note}</InfoNote>}
      </CardContent>
    </Card>
  )
);
FeaturesCard.displayName = "FeaturesCard";

export { StyledLabel, FeatureItem, FeatureList, InfoNote, FeaturesCard };
