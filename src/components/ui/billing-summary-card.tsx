"use client";

import * as React from "react";
import { Calendar, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type BillingStatus = "active" | "trial" | "past_due" | "canceled" | "paused";

export interface BillingPlan {
  name: string;
  price: number;
  interval: "month" | "year";
  features?: string[];
}

export interface UsageItem {
  name: string;
  used: number;
  limit: number;
  unit?: string;
}

export interface BillingSummaryCardProps {
  /** Current plan details */
  plan: BillingPlan;
  /** Billing status */
  status: BillingStatus;
  /** Current billing period end date */
  currentPeriodEnd?: Date;
  /** Trial end date (if in trial) */
  trialEnd?: Date;
  /** Usage items to display */
  usage?: UsageItem[];
  /** Upgrade button click handler */
  onUpgrade?: () => void;
  /** Manage billing click handler */
  onManageBilling?: () => void;
  /** Cancel subscription click handler */
  onCancel?: () => void;
  /** Show upgrade button */
  showUpgrade?: boolean;
  /** Additional className */
  className?: string;
}

const statusConfig: Record<
  BillingStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  active: {
    label: "ACTIVE",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  trial: {
    label: "TRIAL",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
  },
  past_due: {
    label: "PAST_DUE",
    variant: "destructive",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  canceled: {
    label: "CANCELED",
    variant: "outline",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  paused: {
    label: "PAUSED",
    variant: "outline",
    icon: <Clock className="h-3 w-3" />,
  },
};

/* ----- Helper Functions ----- */

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatPrice = (price: number, interval: "month" | "year") => {
  return `$${price}/${interval === "month" ? "mo" : "yr"}`;
};

const getDaysRemaining = (endDate: Date) => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getUsagePercentage = (used: number, limit: number) => {
  return Math.min(Math.round((used / limit) * 100), 100);
};

const getUsageColor = (percentage: number) => {
  if (percentage >= 90) return mode.color.bg.danger;
  if (percentage >= 75) return mode.color.bg.warning;
  return "bg-primary";
};

/* ----- Sub-Components ----- */

interface PlanDetailsSectionProps {
  plan: BillingPlan;
  status: BillingStatus;
  statusInfo: (typeof statusConfig)[BillingStatus];
  currentPeriodEnd?: Date;
  trialEnd?: Date;
}

function PlanDetailsSection({
  plan,
  status,
  statusInfo,
  currentPeriodEnd,
  trialEnd,
}: PlanDetailsSectionProps) {
  return (
    <div className="border-border border-b p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-muted-foreground mb-1 text-xs", mode.font)}>[CURRENT PLAN]:</p>
          <p className={cn("text-foreground text-2xl font-bold", mode.font)}>{plan.name}</p>
          <p className={cn("text-muted-foreground text-xs", mode.font)}>
            {formatPrice(plan.price, plan.interval)}
          </p>
          {status === "trial" && trialEnd && (
            <p className={cn(mode.color.text.warning, "mt-2 text-xs", mode.font)}>
              Trial ends in {getDaysRemaining(trialEnd)} days
            </p>
          )}
          {status === "active" && currentPeriodEnd && (
            <p className={cn("text-muted-foreground mt-2 text-xs", mode.font)}>
              Next billing: {formatDate(currentPeriodEnd)}
            </p>
          )}
          {status === "past_due" && (
            <p className={cn(mode.color.text.danger, "mt-2 text-xs", mode.font)}>
              Action required: Update payment method
            </p>
          )}
        </div>
        <Badge variant={statusInfo.variant} className="gap-1">
          {statusInfo.icon}
          {statusInfo.label}
        </Badge>
      </div>

      {plan.features && plan.features.length > 0 && (
        <div className="mt-4">
          <p className={cn("text-muted-foreground mb-2 text-xs", mode.font)}>[INCLUDES]:</p>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className={cn("text-muted-foreground flex items-center gap-2 text-xs", mode.font)}
              >
                <Zap className="text-primary h-3 w-3" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface UsageSectionProps {
  usage: UsageItem[];
}

function UsageSection({ usage }: UsageSectionProps) {
  if (usage.length === 0) return null;

  return (
    <div className="border-border border-b p-4">
      <p className={cn("text-muted-foreground mb-4 text-xs", mode.font)}>[USAGE_THIS_PERIOD]:</p>
      <div className="space-y-4">
        {usage.map((item, index) => {
          const percentage = getUsagePercentage(item.used, item.limit);
          return (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className={cn("font-medium", mode.font)}>{item.name}</span>
                <span className={cn("text-muted-foreground text-xs", mode.font)}>
                  {item.used.toLocaleString()} / {item.limit.toLocaleString()}
                  {item.unit && ` ${item.unit}`}
                </span>
              </div>
              <div
                className={cn(
                  mode.color.bg.muted,
                  "relative h-2 w-full overflow-hidden",
                  mode.radius
                )}
              >
                <div
                  className={cn("h-full transition-all", getUsageColor(percentage))}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {percentage >= 90 && (
                <p className={cn(mode.color.text.danger, "mt-1 text-xs", mode.font)}>
                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                  Approaching limit
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ActionsSectionProps {
  status: BillingStatus;
  showUpgrade: boolean;
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  onCancel?: () => void;
}

function ActionsSection({
  status,
  showUpgrade,
  onUpgrade,
  onManageBilling,
  onCancel,
}: ActionsSectionProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4">
      {showUpgrade && onUpgrade && (
        <Button onClick={onUpgrade} size="sm" className={cn(mode.radius, mode.font)}>
          &gt; UPGRADE PLAN
        </Button>
      )}
      {onManageBilling && (
        <Button
          onClick={onManageBilling}
          variant="outline"
          size="sm"
          className={cn(mode.radius, mode.font)}
        >
          <Calendar className="mr-1 h-3 w-3" />
          MANAGE BILLING
        </Button>
      )}
      {onCancel && status === "active" && (
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className={cn(mode.color.text.danger, "hover:text-destructive", mode.radius, mode.font)}
        >
          CANCEL
        </Button>
      )}
    </div>
  );
}

export function BillingSummaryCard({
  plan,
  status,
  currentPeriodEnd,
  trialEnd,
  usage = [],
  onUpgrade,
  onManageBilling,
  onCancel,
  showUpgrade = true,
  className,
}: BillingSummaryCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <div className={cn("border-border bg-card border", mode.radius, className)}>
      {/* Terminal Header */}
      <div className="border-border border-b px-4 py-2">
        <span className={cn("text-muted-foreground text-xs", mode.font)}>
          [ [0x00] BILLING_SUMMARY ]
        </span>
      </div>

      {/* Plan Details */}
      <PlanDetailsSection
        plan={plan}
        status={status}
        statusInfo={statusInfo}
        currentPeriodEnd={currentPeriodEnd}
        trialEnd={trialEnd}
      />

      {/* Usage Section */}
      <UsageSection usage={usage} />

      {/* Actions */}
      <ActionsSection
        status={status}
        showUpgrade={showUpgrade}
        onUpgrade={onUpgrade}
        onManageBilling={onManageBilling}
        onCancel={onCancel}
      />
    </div>
  );
}

/* ----- Usage Meter Component ----- */

export interface UsageMeterProps {
  /** Meter label */
  label: string;
  /** Current usage value */
  used: number;
  /** Maximum limit */
  limit: number;
  /** Unit label */
  unit?: string;
  /** Show percentage */
  showPercentage?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

export function UsageMeter({
  label,
  used,
  limit,
  unit,
  showPercentage = true,
  size = "md",
  className,
}: UsageMeterProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);

  const getColor = () => {
    if (percentage >= 90) return mode.color.bg.danger;
    if (percentage >= 75) return mode.color.bg.warning;
    return "bg-primary";
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", mode.font)}>{label}</span>
        <span className={cn("text-muted-foreground text-xs", mode.font)}>
          {used.toLocaleString()} / {limit.toLocaleString()}
          {unit && ` ${unit}`}
          {showPercentage && ` (${percentage}%)`}
        </span>
      </div>
      <div
        className={cn(
          mode.color.bg.muted,
          "relative w-full overflow-hidden",
          sizeClasses[size],
          mode.radius
        )}
      >
        <div
          className={cn("h-full transition-all", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* ----- Plan Selector Component ----- */

export interface PlanOption {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description?: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

export interface PlanSelectorProps {
  /** Available plans */
  plans: PlanOption[];
  /** Currently selected plan ID */
  selectedPlanId?: string;
  /** Plan selection handler */
  onSelectPlan?: (planId: string) => void;
  /** Billing interval toggle */
  showIntervalToggle?: boolean;
  /** Additional className */
  className?: string;
}

export function PlanSelector({
  plans,
  selectedPlanId,
  onSelectPlan,
  className,
}: PlanSelectorProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        const isCurrent = plan.current;

        return (
          <div
            key={plan.id}
            className={cn(
              "bg-card relative border p-4 transition-all",
              mode.radius,
              isSelected
                ? "border-primary ring-primary ring-2"
                : cn("border-border", mode.state.hover.card),
              plan.popular && "ring-primary/20 ring-2"
            )}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <Badge className="absolute -top-2 left-4" variant="default">
                POPULAR
              </Badge>
            )}

            {/* Current Badge */}
            {isCurrent && (
              <Badge className="absolute -top-2 right-4" variant="outline">
                CURRENT
              </Badge>
            )}

            {/* Plan Info */}
            <div className="mb-4 pt-2">
              <h3 className={cn("text-sm font-bold", mode.font)}>{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className={cn("text-muted-foreground text-xs", mode.font)}>
                  /{plan.interval === "month" ? "mo" : "yr"}
                </span>
              </div>
              {plan.description && (
                <p className={cn("text-muted-foreground mt-2 text-xs", mode.font)}>
                  {plan.description}
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="mb-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className={cn("text-muted-foreground flex items-center gap-2 text-xs", mode.font)}
                >
                  <CheckCircle className={cn("h-3 w-3 flex-shrink-0", mode.color.text.success)} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Select Button */}
            <Button
              onClick={() => onSelectPlan?.(plan.id)}
              variant={isSelected || isCurrent ? "default" : "outline"}
              className={cn("w-full", mode.radius, mode.font)}
              disabled={isCurrent}
            >
              {isCurrent ? "CURRENT PLAN" : isSelected ? "SELECTED" : "> SELECT"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
