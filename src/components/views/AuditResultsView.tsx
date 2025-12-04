"use client";

import { useState } from "react";
import { DesignSystemAuditReport, AuditCategory, exportAuditToMarkdown, Inconsistency } from "@/lib/design-system-auditor";
import { Download, FileText, ChevronDown, ChevronRight, Search, Filter, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditResultsViewProps {
  report: DesignSystemAuditReport;
}

// Category configuration for rendering
const CATEGORY_CONFIG: Array<{ key: string; title: string; color: string }> = [
  { key: "colors", title: "Colors", color: "blue" },
  { key: "spacing", title: "Spacing", color: "green" },
  { key: "sizing", title: "Sizing", color: "teal" },
  { key: "borderRadius", title: "Border Radius", color: "orange" },
  { key: "borders", title: "Borders", color: "amber" },
  { key: "shadows", title: "Shadows", color: "purple" },
  { key: "typography", title: "Typography", color: "pink" },
  { key: "layout", title: "Layout", color: "indigo" },
  { key: "effects", title: "Effects", color: "cyan" },
  { key: "cssVariables", title: "CSS Variables", color: "violet" },
  { key: "inlineStyles", title: "Inline Styles", color: "rose" },
  { key: "interactivity", title: "Interactivity", color: "sky" },
  { key: "visibility", title: "Visibility", color: "slate" },
  { key: "transforms", title: "Transforms", color: "fuchsia" },
  { key: "filters", title: "Filters", color: "lime" },
  { key: "gradients", title: "Gradients", color: "red" },
  { key: "textStyles", title: "Text Styles", color: "emerald" },
  { key: "objectFit", title: "Object Fit", color: "stone" },
  { key: "aspectRatio", title: "Aspect Ratio", color: "zinc" },
  { key: "outlines", title: "Outlines", color: "neutral" },
  { key: "rings", title: "Rings", color: "yellow" },
  { key: "divide", title: "Divide", color: "gray" },
  { key: "dynamicClasses", title: "Dynamic Classes", color: "orange" },
  { key: "jsVariables", title: "JS Variables", color: "blue" },
  { key: "themeConfig", title: "Theme Config", color: "purple" },
];

const colorClasses: Record<string, { bg: string; border: string; badge: string }> = {
  orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-800" },
  red: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800" },
  green: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800" },
  pink: { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-100 text-pink-800" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-800" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-800" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-800" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-800" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-800" },
  sky: { bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-100 text-sky-800" },
  slate: { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-800" },
  fuchsia: { bg: "bg-fuchsia-50", border: "border-fuchsia-200", badge: "bg-fuchsia-100 text-fuchsia-800" },
  lime: { bg: "bg-lime-50", border: "border-lime-200", badge: "bg-lime-100 text-lime-800" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800" },
  stone: { bg: "bg-stone-50", border: "border-stone-200", badge: "bg-stone-100 text-stone-800" },
  zinc: { bg: "bg-zinc-50", border: "border-zinc-200", badge: "bg-zinc-100 text-zinc-800" },
  neutral: { bg: "bg-neutral-50", border: "border-neutral-200", badge: "bg-neutral-100 text-neutral-800" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-800" },
};

// Severity color/icon mapping
const severityConfig = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    badge: "bg-red-100 text-red-800",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "bg-blue-100 text-blue-800",
    icon: Info,
    iconColor: "text-blue-500",
  },
};

function InconsistencyCard({ inconsistency }: { inconsistency: Inconsistency }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[inconsistency.severity];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between p-4"
      >
        <div className="flex items-start gap-3">
          <Icon className={`mt-0.5 h-5 w-5 ${config.iconColor}`} />
          <div className="text-left">
            <div className="font-medium text-gray-900">{inconsistency.description}</div>
            <div className="mt-1 text-sm text-gray-600">{inconsistency.recommendation}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badge}`}>
            {inconsistency.severity}
          </span>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 p-4 text-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="font-medium text-green-700">Dominant:</span>
            <code className="rounded bg-green-100 px-2 py-0.5 text-green-800">
              {inconsistency.dominantPattern}
            </code>
            <span className="text-gray-500">
              ({inconsistency.dominantCount}x, {inconsistency.dominantPercentage}%)
            </span>
          </div>

          <div className="space-y-2">
            <span className="font-medium text-red-700">Outliers to fix:</span>
            {inconsistency.outliers.map((outlier, i) => (
              <div key={i} className="ml-4 rounded bg-white p-2">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-red-50 px-2 py-0.5 text-red-700">
                    {outlier.pattern}
                  </code>
                  <span className="text-gray-500">
                    ({outlier.count}x, {outlier.percentage}%)
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {outlier.files.map((f, j) => (
                    <div key={j} className="text-xs text-gray-500">
                      {f.file}:{f.line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AuditResultsView({ report }: AuditResultsViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState("");
  const [showFilesOnly, setShowFilesOnly] = useState(false);
  const [showAllPatterns, setShowAllPatterns] = useState(false);

  const toggleCategory = (key: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    const allKeys = CATEGORY_CONFIG.map(c => c.key);
    setExpandedCategories(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `design-system-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const markdown = exportAuditToMarkdown(report);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `design-system-audit-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats for summary
  const getCategorySummary = () => {
    const summary: Array<{ key: string; title: string; uniqueCount: number; totalCount: number; color: string }> = [];

    for (const config of CATEGORY_CONFIG) {
      const category = report.categories[config.key as keyof typeof report.categories];
      if (!category) continue;

      const allCodes = Object.values(category).flatMap((c: AuditCategory) => c.violations.map(v => v.code));
      const uniqueCount = new Set(allCodes).size;
      const totalCount = Object.values(category).reduce((sum: number, c: AuditCategory) => sum + c.count, 0);

      if (totalCount > 0) {
        summary.push({ key: config.key, title: config.title, uniqueCount, totalCount, color: config.color });
      }
    }

    return summary.sort((a, b) => b.uniqueCount - a.uniqueCount);
  };

  const categorySummary = getCategorySummary();

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Design System Audit Results</h2>
            <p className="mt-1 text-sm text-gray-500">
              {report.totalPatterns} patterns found across {report.totalFiles} files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
              <FileText className="mr-2 h-4 w-4" />
              Markdown
            </Button>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter patterns..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilesOnly(!showFilesOnly)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilesOnly ? "Show All" : "Files Only"}
          </Button>
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Inconsistencies Section - Primary Focus */}
        {report.inconsistencies && report.inconsistencies.totalInconsistencies > 0 ? (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Design System Inconsistencies</h3>
                <p className="text-sm text-gray-500">
                  {report.inconsistencies.totalInconsistencies} inconsistencies found
                  {report.inconsistencies.critical > 0 && (
                    <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      {report.inconsistencies.critical} critical
                    </span>
                  )}
                  {report.inconsistencies.warning > 0 && (
                    <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {report.inconsistencies.warning} warnings
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {report.inconsistencies.inconsistencies.map((inc, i) => (
                <InconsistencyCard key={i} inconsistency={inc} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <div className="font-medium text-green-900">No Significant Inconsistencies Found</div>
                <div className="text-sm text-green-700">
                  Your design system patterns are consistent. The patterns below show your current usage.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle for All Patterns */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllPatterns(!showAllPatterns)}
            className="w-full"
          >
            {showAllPatterns ? "Hide" : "Show"} All Detected Patterns ({report.totalPatterns} total)
          </Button>
        </div>

        {/* All Patterns Section - Secondary */}
        {showAllPatterns && (
          <>
            {/* Summary Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categorySummary.map(({ key, title, uniqueCount, color }) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`rounded-lg border p-3 text-left transition-all hover:shadow-md ${colorClasses[color]?.bg || "bg-gray-50"} ${colorClasses[color]?.border || "border-gray-200"}`}
                >
                  <div className="text-2xl font-bold text-gray-900">{uniqueCount}</div>
                  <div className="text-sm text-gray-600">{title}</div>
                </button>
              ))}
            </div>

        {/* Category Details */}
        <div className="space-y-4">
          {CATEGORY_CONFIG.map(({ key, title, color }) => {
            const category = report.categories[key as keyof typeof report.categories];
            if (!category) return null;

            const hasMatches = Object.values(category).some((c: AuditCategory) => c.count > 0);
            if (!hasMatches) return null;

            // Apply search filter
            const filteredCategories: Record<string, AuditCategory> = {};
            let hasFilteredMatches = false;

            for (const [subKey, subCat] of Object.entries(category as Record<string, AuditCategory>)) {
              if (subCat.count === 0) continue;

              if (searchFilter) {
                const filteredViolations = subCat.violations.filter(v =>
                  v.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  v.file.toLowerCase().includes(searchFilter.toLowerCase())
                );
                if (filteredViolations.length > 0) {
                  filteredCategories[subKey] = { ...subCat, violations: filteredViolations, count: filteredViolations.length };
                  hasFilteredMatches = true;
                }
              } else {
                filteredCategories[subKey] = subCat;
                hasFilteredMatches = true;
              }
            }

            if (!hasFilteredMatches) return null;

            const isExpanded = expandedCategories.has(key);
            const allCodes = Object.values(filteredCategories).flatMap((c: AuditCategory) => c.violations.map(v => v.code));
            const uniqueCount = new Set(allCodes).size;
            const totalCount = Object.values(filteredCategories).reduce((sum: number, c: AuditCategory) => sum + c.count, 0);

            return (
              <div key={key} className={`rounded-lg border ${colorClasses[color]?.border || "border-gray-200"} ${colorClasses[color]?.bg || "bg-white"}`}>
                <button
                  onClick={() => toggleCategory(key)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-lg font-semibold text-gray-900">{title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${colorClasses[color]?.badge || "bg-gray-100 text-gray-800"}`}>
                      {uniqueCount} unique
                    </span>
                    <span className="text-sm text-gray-500">{totalCount} total</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    {Object.entries(filteredCategories)
                      .filter(([, cat]) => cat.count > 0)
                      .map(([subKey, cat]) => {
                        // Group by code
                        const codeGroups: Record<string, typeof cat.violations> = {};
                        for (const v of cat.violations) {
                          if (!codeGroups[v.code]) codeGroups[v.code] = [];
                          codeGroups[v.code].push(v);
                        }
                        const sortedCodes = Object.entries(codeGroups).sort((a, b) => b[1].length - a[1].length);

                        return (
                          <div key={subKey} className="mb-4 last:mb-0">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium text-gray-700">{cat.description}</h4>
                              <span className="text-sm text-gray-500">{Object.keys(codeGroups).length} unique patterns</span>
                            </div>

                            {showFilesOnly ? (
                              // File-based view
                              <div className="space-y-1">
                                {sortedCodes.slice(0, 20).map(([code, violations]) => (
                                  <div key={code} className="rounded bg-white p-2">
                                    <div className="flex items-start justify-between">
                                      <code className="rounded bg-gray-100 px-2 py-1 text-sm">{code}</code>
                                      <span className="ml-2 text-sm text-gray-500">x{violations.length}</span>
                                    </div>
                                    <div className="mt-1 space-y-0.5">
                                      {violations.slice(0, 5).map((v, i) => (
                                        <div key={i} className="text-xs text-gray-500">
                                          {v.file}:{v.line}
                                        </div>
                                      ))}
                                      {violations.length > 5 && (
                                        <div className="text-xs text-gray-400">+{violations.length - 5} more</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {sortedCodes.length > 20 && (
                                  <div className="text-sm text-gray-400">+{sortedCodes.length - 20} more patterns</div>
                                )}
                              </div>
                            ) : (
                              // Pattern badges view
                              <div className="flex flex-wrap gap-2">
                                {sortedCodes.slice(0, 30).map(([code, violations]) => (
                                  <span
                                    key={code}
                                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm shadow-sm"
                                    title={`${violations.length} occurrences\n${violations.slice(0, 3).map(v => `${v.file}:${v.line}`).join('\n')}`}
                                  >
                                    <code className="text-gray-800">{code}</code>
                                    <span className="text-gray-400">x{violations.length}</span>
                                  </span>
                                ))}
                                {sortedCodes.length > 30 && (
                                  <span className="inline-flex items-center px-3 py-1 text-sm text-gray-400">
                                    +{sortedCodes.length - 30} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
