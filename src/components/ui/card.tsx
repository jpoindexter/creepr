/**
 * ✅ FABRK COMPONENT
 * Card - ONE canonical card component for the entire codebase.
 * One shell, content is composition. Variants control tone, size, and interactivity.
 *
 * Design System Integration:
 * - Imports from @/design-system for static mode (server components)
 * - Radius from visual mode config (mode.radius applies the correct value)
 * - Spacing follows 8-point grid
 *
 * Size Guide:
 * - "auto": Natural height, use for standalone cards, notes, badges
 * - "full": h-full for equal-height grids (default)
 *
 * NAMING: Use generic names (Card, CardHeader, etc.) in new code.
 * Legacy names (Card, etc.) are deprecated but still exported for compatibility.
 *
 * @example
 * ```tsx
 * // Grid card (equal heights)
 * <Card tone="primary" interactive>
 *   <CardHeader code="0x00" title="TITLE" icon={<Icon />} />
 *   <CardContent>Any content here</CardContent>
 * </Card>
 *
 * // Standalone card (natural height)
 * <Card size="auto">
 *   <CardContent>Note content</CardContent>
 * </Card>
 * ```
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { mode } from "@/design-system";

/**
 * Card - ONE canonical card component
 * One shell, content is composition. Variants control tone, size, and interactivity.
 */
export type CardTone = "neutral" | "primary" | "success" | "warning" | "danger";
export type CardSize = "auto" | "full";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Color tone for border */
  tone?: CardTone;
  /** Size behavior: "auto" = natural height, "full" = h-full for grids */
  size?: CardSize;
  /** Enable hover/focus states for interactive cards */
  interactive?: boolean;
  /** Semantic HTML element */
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
  auto: "", // Natural height
  full: "h-full", // Equal height for grids
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
        // Base styles - ONE card shell + CRT scanlines in Terminal mode
        "crt-scanlines relative flex flex-col overflow-hidden border",
        mode.color.bg.surface,
        mode.radius,

        // Tone (border color)
        toneStyles[tone],

        // Size behavior
        sizeStyles[size],

        // Interactive states
        interactive && cn("group transition-colors", mode.state.hover.card),

        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/**
 * CardHeader - Header with terminal pattern [ [0xXX] TITLE ]
 * Auto-generates hex code from title if not provided
 */
export type CardHeaderProps = {
  /** Hex code displayed in brackets (e.g., "0x00", "0x01"). Auto-generates from title if not provided. */
  code?: string;
  /** Title displayed after the hex code in UPPERCASE_SNAKE_CASE */
  title: string;
  /** Optional icon displayed on the right side of header */
  icon?: React.ReactNode;
  /** Optional metadata displayed on right (e.g., "8 items") */
  meta?: React.ReactNode;
  /** Optional className for additional styling */
  className?: string;
};

// Generate deterministic hex code from string (consistent but varied)
function generateHexFromTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return (
    "0x" +
    Math.abs(hash % 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0")
  );
}

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
          "last:border-b-0", // Remove bottom border when CardHeader is last child (no CardContent)
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

/**
 * CardContent - Content area with configurable padding
 */
export type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Padding size */
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

/**
 * CardFooter - Footer area for actions
 */
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

/**
 * Stat - Key-value pair with label and highlighted value
 * Used in hero cards and stat displays
 *
 * @example
 * ```tsx
 * <StatGroup>
 *   <Stat label="Speed" value="OPTIMIZED" />
 *   <Stat label="Integration" value="SEAMLESS" />
 * </StatGroup>
 * ```
 */
export type StatProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Label text (muted color) */
  label: string;
  /** Value text (primary color) */
  value: string | number;
  /** Size variant */
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

/**
 * StatGroup - Container for multiple Stat components
 */
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

/**
 * Bracketed label with brackets
 * Used for [LABEL]: patterns throughout templates
 *
 * @example
 * ```tsx
 * <StyledLabel>TEMPLATE FEATURES</StyledLabel>
 * // Renders: [TEMPLATE FEATURES]:
 * ```
 */
export type StyledLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The label text (will be wrapped in brackets with colon) */
  children: React.ReactNode;
  /** Whether to show the colon after the brackets */
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

/**
 * Feature list item with > prefix
 * Used for listing features in template cards
 *
 * @example
 * ```tsx
 * <FeatureItem>Multi-step form wizard</FeatureItem>
 * // Renders: > Multi-step form wizard
 * ```
 */
export type FeatureItemProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  /** Icon to use before text. Defaults to ">" */
  icon?: "arrow" | "check" | "dot";
};

const FeatureItem = React.forwardRef<HTMLDivElement, FeatureItemProps>(
  ({ children, icon = "arrow", className, ...props }, ref) => {
    const iconMap = {
      arrow: ">",
      check: "✓",
      dot: "•",
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

/**
 * Feature list container
 * Wraps multiple FeatureItem components
 *
 * @example
 * ```tsx
 * <FeatureList>
 *   <FeatureItem>Feature 1</FeatureItem>
 *   <FeatureItem>Feature 2</FeatureItem>
 * </FeatureList>
 * ```
 */
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

/**
 * Note/info text
 * Used for [NOTE]: patterns at the bottom of feature cards
 *
 * @example
 * ```tsx
 * <InfoNote>Connect to your API to persist data.</InfoNote>
 * // Renders: [NOTE]: Connect to your API to persist data.
 * ```
 */
export type InfoNoteProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  /** Label text. Defaults to "NOTE" */
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

/**
 * Badge - Inline badge with terminal pattern [ [0xXX] LABEL ] META
 * Used for section headers, page labels, and inline status indicators.
 * This is NOT a card - it's a compact inline element.
 *
 * @example
 * ```tsx
 * // Section header badge
 * <Badge code="0x00" label="SYSTEM INIT" meta="SAAS BOILERPLATE v2.0" />
 *
 * // Simple badge without meta
 * <Badge code="0x50" label="DEV EXPERIENCE" />
 * ```
 */
export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Hex code displayed in brackets (e.g., "0x00", "0x01") */
  code?: string;
  /** Primary label text */
  label: string;
  /** Optional metadata after the label (e.g., "v2.0", "FIB[144]") */
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

/**
 * Page badge
 * Used for [TEMPLATE]: NAME badges at top of template pages
 *
 * @example
 * ```tsx
 * <PageBadge>SIGN IN</PageBadge>
 * // Renders: [TEMPLATE]: SIGN IN
 * ```
 */
export type PageBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  /** Prefix label. Defaults to "TEMPLATE" */
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

/**
 * Template page header component
 * Combines badge, title, and description in a consistent layout
 *
 * @example
 * ```tsx
 * <TemplatePageHeader
 *   badge="SIGN IN"
 *   title="Sign In"
 *   description="Login page with social auth options"
 * />
 * ```
 */
export type TemplatePageHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Badge text (appears in [TEMPLATE]: BADGE) */
  badge: string;
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Badge prefix. Defaults to "TEMPLATE" */
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

/**
 * Features card with header and feature list
 * Complete card component for template feature documentation
 *
 * @example
 * ```tsx
 * <FeaturesCard
 *   title="TEMPLATE FEATURES"
 *   features={["Feature 1", "Feature 2"]}
 *   note="Connect to your API for real data."
 * />
 * ```
 */
export type FeaturesCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Card header title */
  title?: string;
  /** Hex code for header */
  code?: string;
  /** List of feature strings */
  features: string[];
  /** Optional note text at bottom */
  note?: string;
  /** Feature icon type */
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

/**
 * MetricCard - Terminal-style stat/metric display card
 * Used for displaying key metrics with terminal header pattern
 *
 * @example
 * ```tsx
 * <MetricCard
 *   code="0x1A"
 *   title="UI_COMPONENTS"
 *   value="77+"
 *   label="UI Components"
 *   icon={<Box className="size-5" />}
 * />
 * ```
 */
export type MetricCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Hex code for header (e.g., "0x1A"). Auto-generates from title if not provided. */
  code?: string;
  /** Header title in SNAKE_CASE format */
  title: string;
  /** Large display value (e.g., "77+", "$199") */
  value: string | number;
  /** Label below value */
  label: string;
  /** Icon displayed in header right side */
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
        {/* Terminal Header */}
        {/* Terminal Header */}
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

        {/* Content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          {/* Value */}
          <div className={cn("text-5xl leading-none font-bold", mode.font, mode.color.text.accent)}>
            {value}
          </div>

          {/* Label */}
          <div className={cn("mt-2 text-sm font-bold tracking-wide uppercase", mode.font)}>
            {label}
          </div>
        </div>
      </div>
    );
  }
);
MetricCard.displayName = "MetricCard";

/**
 * FeatureCard - Terminal-style feature card with stats and includes
 * Full marketing feature card with header, description, stats band, feature list, and CTA
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   code="0x15"
 *   title="EMAIL_SYSTEM"
 *   icon={<Mail className="size-5" />}
 *   headline="Transactional emails that just work"
 *   description="Resend integration with React Email templates..."
 *   stats={[
 *     { label: "TIME SAVED", value: "30+ HRS" },
 *     { label: "COST SAVED", value: "$3K" }
 *   ]}
 *   includes={["Resend Integration", "React Email Templates"]}
 *   ctaLabel="EMAIL TEMPLATES"
 *   ctaHref="/docs/features/email"
 * />
 * ```
 */
export type FeatureCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Hex code for header */
  code?: string;
  /** Header title in SNAKE_CASE */
  title: string;
  /** Icon for header */
  icon?: React.ReactNode;
  /** Main headline text */
  headline: string;
  /** Description paragraph */
  description: string;
  /** Stats to display in band (2 max) */
  stats?: Array<{ label: string; value: string }>;
  /** Features included list */
  includes?: string[];
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button href */
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
        {/* Terminal Header */}
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
          {/* Headline - max 2 lines */}
          <h3
            className={cn(
              "min-h-line-2 line-clamp-2 text-sm leading-tight font-bold tracking-wide uppercase",
              mode.font,
              "text-foreground"
            )}
          >
            {headline}
          </h3>

          {/* Description - fixed height for consistency */}
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

        {/* Includes List - always show 3 items for consistency */}
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
                  <span className="mt-micro text-warning text-sm font-bold">✓</span>
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
              <span className="text-sm">→</span>
            </a>
          </div>
        )}
      </div>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

// Export all components
export {
  // Core Card components
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  // Metric Card (terminal-style stats)
  MetricCard,
  // Feature Card (terminal-style marketing card)
  FeatureCard,
  // Stat components
  Stat,
  StatGroup,
  // Badge
  Badge,
  // Helper components
  StyledLabel,
  FeatureItem,
  FeatureList,
  InfoNote,
  PageBadge,
  TemplatePageHeader,
  FeaturesCard,
};
