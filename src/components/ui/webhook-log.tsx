"use client";

/**
 * ✅ FABRK COMPONENT - PRO PACK
 * Webhook Log - Track webhook delivery status
 *
 * Features:
 * - DataTable of webhook events
 * - Status badges (success/failed/pending/retrying)
 * - Expandable rows for request/response payloads
 * - Retry failed webhooks button
 * - Filter by status, endpoint, date
 * - Real-time updates (optional via polling)
 *
 * Design System Integration:
 * - Terminal aesthetic with mode.radius, mode.font
 * - Design tokens only (no hardcoded colors)
 * - 8-point grid spacing
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <WebhookLog
 *   userId="user_123"
 *   onRetry={(logId) => retryWebhook(logId)}
 * />
 * ```
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { Card } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet";
import { CodeBlock } from "./code-block";
import { Search, RefreshCw, ExternalLink, Clock } from "lucide-react";

export type WebhookStatus = "success" | "failed" | "pending" | "retrying";

export interface WebhookLogEntry {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  status: WebhookStatus;
  statusCode: number | null;
  requestPayload: string;
  responsePayload: string | null;
  error: string | null;
  timestamp: Date;
  duration: number | null; // milliseconds
  retryCount: number;
}

export interface WebhookLogProps {
  className?: string;
  userId?: string;
  onRetry?: (logId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  initialLogs?: WebhookLogEntry[];
  realtimeUpdates?: boolean;
  pollInterval?: number; // milliseconds
}

/* ----- Helper Functions ----- */

const getStatusBadgeVariant = (status: WebhookStatus) => {
  switch (status) {
    case "success":
      return "default"; // Will use success color via className
    case "failed":
      return "destructive";
    case "pending":
      return "secondary";
    case "retrying":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: WebhookStatus) => {
  switch (status) {
    case "success":
      return "✓";
    case "failed":
      return "✕";
    case "pending":
      return "⏳";
    case "retrying":
      return "↻";
    default:
      return "";
  }
};

/* ----- Sub-Components ----- */

interface WebhookFiltersProps {
  searchQuery: string;
  statusFilter: WebhookStatus | "all";
  isRefreshing: boolean;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: WebhookStatus | "all") => void;
  onRefresh: () => void;
}

function WebhookFilters({
  searchQuery,
  statusFilter,
  isRefreshing,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
}: WebhookFiltersProps) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className={cn("text-sm font-semibold tracking-tight", mode.font)}>
            [ WEBHOOK_LOGS ]
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Track webhook delivery status and debug failures
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(mode.radius, mode.font)}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {"> "}REFRESH
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by endpoint or error..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn("pl-10", mode.radius, mode.font)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as WebhookStatus | "all")}
        >
          <SelectTrigger className={cn("w-full sm:w-44", mode.radius, mode.font)}>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className={cn(mode.radius)}>
            <SelectItem value="all" className={cn(mode.font)}>
              [ALL_STATUS]
            </SelectItem>
            <SelectItem value="success" className={cn(mode.font)}>
              [SUCCESS]
            </SelectItem>
            <SelectItem value="failed" className={cn(mode.font)}>
              [FAILED]
            </SelectItem>
            <SelectItem value="pending" className={cn(mode.font)}>
              [PENDING]
            </SelectItem>
            <SelectItem value="retrying" className={cn(mode.font)}>
              [RETRYING]
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

interface WebhookLogEntryItemProps {
  log: WebhookLogEntry;
  isRetrying: boolean;
  onRetry?: (logId: string) => void;
  onViewDetails: (log: WebhookLogEntry) => void;
}

function WebhookLogEntryItem({
  log,
  isRetrying,
  onRetry,
  onViewDetails,
}: WebhookLogEntryItemProps) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-4">
        {/* Status & Method */}
        <div className="flex flex-col items-center gap-2">
          <Badge
            variant={getStatusBadgeVariant(log.status)}
            className={cn(
              "w-20 justify-center",
              mode.font,
              log.status === "success" &&
                `${mode.color.bg.successMuted} ${mode.color.text.success} ${mode.color.border.success}`
            )}
          >
            {getStatusIcon(log.status)} {log.status.toUpperCase()}
          </Badge>
          <span
            className={cn(
              mode.color.text.muted,
              mode.color.border.default,
              "border px-2 py-1 text-xs",
              mode.radius,
              mode.font
            )}
          >
            {log.method}
          </span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", mode.font)}>{log.endpoint}</p>
              <div
                className={cn(
                  "text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs",
                  mode.font
                )}
              >
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                {log.duration && <span>• {log.duration}ms</span>}
                {log.statusCode && <span>• Status: {log.statusCode}</span>}
                {log.retryCount > 0 && <span>• Retries: {log.retryCount}</span>}
              </div>
            </div>

            <div className="flex gap-2">
              {log.status === "failed" && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRetry(log.id)}
                  disabled={isRetrying}
                  className={cn("text-xs", mode.radius, mode.font)}
                >
                  {isRetrying ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  RETRY
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails(log)}
                className={cn("text-xs", mode.radius, mode.font)}
              >
                <ExternalLink className="h-3 w-3" />
                VIEW
              </Button>
            </div>
          </div>

          {log.error && (
            <div
              className={cn(
                mode.color.bg.dangerMuted,
                mode.color.border.danger,
                "border px-4 py-2",
                mode.radius
              )}
            >
              <p className={cn(mode.color.text.danger, "text-xs", mode.font)}>
                [ERROR]: {log.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface WebhookDetailsSheetProps {
  log: WebhookLogEntry | null;
  onClose: () => void;
}

function WebhookDetailsSheet({ log, onClose }: WebhookDetailsSheetProps) {
  return (
    <Sheet open={!!log} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className={cn("w-full overflow-y-auto sm:max-w-2xl", mode.radius)}>
        {log && (
          <>
            <SheetHeader>
              <SheetTitle className={cn(mode.font)}>[ WEBHOOK DETAILS ]</SheetTitle>
              <SheetDescription>Full request and response payloads for debugging</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Metadata */}
              <div className="space-y-2">
                <p className={cn("text-xs font-semibold", mode.font)}>[METADATA]:</p>
                <div
                  className={cn(
                    mode.color.bg.muted,
                    mode.color.border.default,
                    "space-y-1 border px-4 py-2",
                    mode.radius
                  )}
                >
                  <div className="flex justify-between text-xs">
                    <span className={cn("text-muted-foreground", mode.font)}>[ID]:</span>
                    <span className={cn(mode.font)}>{log.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={cn("text-muted-foreground", mode.font)}>[ENDPOINT]:</span>
                    <span className={cn(mode.font)}>{log.endpoint}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={cn("text-muted-foreground", mode.font)}>[METHOD]:</span>
                    <span className={cn(mode.font)}>{log.method}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={cn("text-muted-foreground", mode.font)}>[TIMESTAMP]:</span>
                    <span className={cn(mode.font)}>{new Date(log.timestamp).toISOString()}</span>
                  </div>
                  {log.duration && (
                    <div className="flex justify-between text-xs">
                      <span className={cn("text-muted-foreground", mode.font)}>[DURATION]:</span>
                      <span className={cn(mode.font)}>{log.duration}ms</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Payload */}
              <div className="space-y-2">
                <p className={cn("text-xs font-semibold", mode.font)}>[REQUEST PAYLOAD]:</p>
                <CodeBlock code={log.requestPayload} language="json" maxHeight="300px" />
              </div>

              {/* Response Payload */}
              {log.responsePayload && (
                <div className="space-y-2">
                  <p className={cn("text-xs font-semibold", mode.font)}>[RESPONSE PAYLOAD]:</p>
                  <CodeBlock code={log.responsePayload} language="json" maxHeight="300px" />
                </div>
              )}

              {/* Error */}
              {log.error && (
                <div className="space-y-2">
                  <p className={cn("text-xs font-semibold", mode.font)}>[ERROR]:</p>
                  <div
                    className={cn(
                      mode.color.bg.dangerMuted,
                      mode.color.border.danger,
                      "border p-4",
                      mode.radius
                    )}
                  >
                    <p className={cn(mode.color.text.danger, "text-xs", mode.font)}>{log.error}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function WebhookLog({
  className,
  userId: _userId,
  onRetry,
  onRefresh,
  initialLogs = [],
  realtimeUpdates = false,
  pollInterval = 5000,
}: WebhookLogProps) {
  const [logs] = React.useState<WebhookLogEntry[]>(initialLogs);
  const [filteredLogs, setFilteredLogs] = React.useState<WebhookLogEntry[]>(initialLogs);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<WebhookStatus | "all">("all");
  const [selectedLog, setSelectedLog] = React.useState<WebhookLogEntry | null>(null);
  const [isRetrying, setIsRetrying] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Apply filters
  React.useEffect(() => {
    let filtered = logs;

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.error?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, statusFilter]);

  // Real-time polling (optional)
  React.useEffect(() => {
    if (!realtimeUpdates || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [realtimeUpdates, onRefresh, pollInterval]);

  const handleRetry = async (logId: string) => {
    if (!onRetry) return;

    setIsRetrying(logId);
    try {
      await onRetry(logId);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Failed to retry webhook:", error);
    } finally {
      setIsRetrying(null);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <WebhookFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        isRefreshing={isRefreshing}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onRefresh={handleRefresh}
      />

      <Card className={cn(mode.radius)}>
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className={cn("text-muted-foreground text-sm", mode.font)}>
              {searchQuery || statusFilter !== "all"
                ? "[NO_LOGS_FOUND]: Try adjusting filters"
                : "[NO_WEBHOOK_LOGS]: Webhook events will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {filteredLogs.map((log) => (
              <WebhookLogEntryItem
                key={log.id}
                log={log}
                isRetrying={isRetrying === log.id}
                onRetry={onRetry ? handleRetry : undefined}
                onViewDetails={setSelectedLog}
              />
            ))}
          </div>
        )}
      </Card>

      <WebhookDetailsSheet log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
