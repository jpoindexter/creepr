/**
 * Card - ONE canonical card component for the entire codebase.
 * One shell, content is composition. Variants control tone, size, and interactivity.
 *
 * This file provides backward compatibility for existing imports.
 * For new code, import directly from '@/components/ui/card'.
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

// Re-export all card components from modular package
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
} from "./card/index";

// Re-export types
export type {
  CardTone,
  CardSize,
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
  StatProps,
  StatGroupProps,
  StyledLabelProps,
  FeatureItemProps,
  FeatureListProps,
  InfoNoteProps,
  BadgeProps,
  PageBadgeProps,
  TemplatePageHeaderProps,
  FeaturesCardProps,
  MetricCardProps,
  FeatureCardProps,
} from "./card/index";
