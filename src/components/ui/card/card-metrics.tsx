/**
 * Card Metric Components
 * MetricCard and FeatureCard for marketing displays
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { generateHexFromTitle } from "./card-core";

export type MetricCardProps = React.HTMLAttributes<HTMLDivElement> & {
  code?: string;
  title: string;
  value: string | number;
  label: string;
  icon?: React.ReactNode;
};

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ code, title, value, label, icon, className, ...props }, ref) => {
    const hexCode = code ?? generateHexFromTitle(title);

    return (
      <div
        ref={ref}
        data-slot="metric-card"
        className={cn(
          "relative flex flex-col border",
          mode.color.bg.surface,
          mode.color.border.default,
          mode.radius,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-11 shrink-0 items-center justify-between border-b px-4",
            mode.color.border.default
          )}
        >
          <span className={cn("text-xs tracking-wide", mode.font, mode.color.text.muted)}>
            [{hexCode}] {title}
          </span>
          {icon && <span className={mode.color.text.accent}>{icon}</span>}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <div className={cn("text-5xl leading-none font-bold", mode.font, mode.color.text.accent)}>
            {value}
          </div>
          <div className={cn("mt-2 text-sm font-bold tracking-wide uppercase", mode.font)}>
            {label}
          </div>
        </div>
      </div>
    );
  }
);
MetricCard.displayName = "MetricCard";

export type FeatureCardProps = React.HTMLAttributes<HTMLDivElement> & {
  code?: string;
  title: string;
  icon?: React.ReactNode;
  headline: string;
  description: string;
  stats?: Array<{ label: string; value: string }>;
  includes?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      code,
      title,
      icon,
      headline,
      description,
      stats,
      includes,
      ctaLabel,
      ctaHref,
      className,
      ...props
    },
    ref
  ) => {
    const hexCode = code ?? generateHexFromTitle(title);

    return (
      <div
        ref={ref}
        data-slot="feature-card"
        className={cn(
          "relative flex flex-col border",
          mode.color.bg.surface,
          mode.color.border.default,
          mode.radius,
          "group transition-colors",
          mode.state.hover.card,
          className
        )}
        {...props}
      >
        {/* Header */}
        <div
          className={cn(
            "flex h-11 shrink-0 items-center justify-between border-b px-4",
            mode.color.border.default
          )}
        >
          <span className={cn("text-xs tracking-wide", mode.font, mode.color.text.muted)}>
            [{hexCode}] {title}
          </span>
          {icon && <span className={mode.color.text.accent}>{icon}</span>}
        </div>

        {/* Main Content */}
        <div className="flex flex-col p-6 pb-0">
          <h3
            className={cn(
              "min-h-line-2 line-clamp-2 text-sm leading-tight font-bold tracking-wide uppercase",
              mode.font,
              "text-foreground"
            )}
          >
            {headline}
          </h3>

          <p
            className={cn(
              "min-h-line-3 mt-3 line-clamp-3 text-sm leading-relaxed",
              mode.font,
              mode.color.text.muted
            )}
          >
            {description}
          </p>
        </div>

        {/* Stats Band */}
        {stats && stats.length > 0 && (
          <div className={cn("border-border bg-background mt-4 flex gap-4 border-y px-6 py-4")}>
            {stats.map((stat, index) => (
              <React.Fragment key={stat.label}>
                {index > 0 && <div className="bg-border w-px" />}
                <div className={cn("flex flex-1 flex-col gap-1", index > 0 && "pl-2")}>
                  <p
                    className={cn(
                      "tracking-caps text-xs font-medium uppercase",
                      mode.font,
                      mode.color.text.muted
                    )}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "text-warning text-xl leading-none font-bold tracking-tight",
                      mode.font
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Includes List */}
        {includes && includes.length > 0 && (
          <div className="flex flex-col gap-2 p-6">
            <p
              className={cn(
                "mb-1 text-xs font-bold tracking-wider uppercase",
                mode.font,
                mode.color.text.muted
              )}
            >
              [INCLUDES]:
            </p>
            <ul className="flex flex-col gap-2">
              {includes.slice(0, 3).map((item) => (
                <li key={item} className="group/item flex items-start gap-2">
                  <span className="mt-micro text-warning text-sm font-bold">{"\u2713"}</span>
                  <span
                    className={cn(
                      "group-hover/item:text-foreground line-clamp-1 text-sm transition-colors",
                      mode.font,
                      mode.color.text.muted
                    )}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        {ctaLabel && ctaHref && (
          <div className="mt-auto p-6 pt-0">
            <a
              href={ctaHref}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-2 border text-xs font-medium",
                "bg-transparent transition-all duration-200",
                mode.color.border.default,
                mode.color.text.muted,
                mode.radius,
                mode.font,
                "hover:border-warning hover:text-warning"
              )}
            >
              &gt; {ctaLabel}
              <span className="text-sm">{"\u2192"}</span>
            </a>
          </div>
        )}
      </div>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

export { MetricCard, FeatureCard };
