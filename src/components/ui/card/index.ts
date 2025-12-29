/**
 * Card Components
 * ONE canonical card component for the entire codebase.
 * Re-exports from modular card package.
 */

// Core card components
export { Card, CardHeader, CardContent, CardFooter, generateHexFromTitle } from "./card-core";
export type {
  CardTone,
  CardSize,
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
} from "./card-core";

// Stat components
export { Stat, StatGroup } from "./card-stats";
export type { StatProps, StatGroupProps } from "./card-stats";

// Feature components
export { StyledLabel, FeatureItem, FeatureList, InfoNote, FeaturesCard } from "./card-features";
export type {
  StyledLabelProps,
  FeatureItemProps,
  FeatureListProps,
  InfoNoteProps,
  FeaturesCardProps,
} from "./card-features";

// Badge components
export { Badge, PageBadge } from "./card-badges";
export type { BadgeProps, PageBadgeProps } from "./card-badges";

// Template components
export { TemplatePageHeader } from "./card-templates";
export type { TemplatePageHeaderProps } from "./card-templates";

// Metric components
export { MetricCard, FeatureCard } from "./card-metrics";
export type { MetricCardProps, FeatureCardProps } from "./card-metrics";
