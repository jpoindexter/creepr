/**
 * Status Panel Types
 * Shared type definitions for status panel components
 */

import type {
  PageStyles,
  SecurityHeaders,
  KeywordDensity,
  MobileResponsiveness,
} from "@/lib/crawler/types";
import type {
  FailedUrl,
  ErrorSummary,
  MetaInfo,
  HeadingInfo,
  ImageInfo,
  ContentMetrics,
} from "@/types/sitemap";

export interface SelectedNodeData {
  title: string;
  url: string;
  statusCode: number;
  styles?: PageStyles;
  meta?: MetaInfo;
  headings?: HeadingInfo[];
  images?: ImageInfo[];
  contentMetrics?: ContentMetrics;
  isApiEndpoint?: boolean;
  securityHeaders?: SecurityHeaders;
  keywordDensity?: KeywordDensity;
  mobileResponsiveness?: MobileResponsiveness;
}

export interface StatusPanelProps {
  totalPages: number;
  brokenLinks: number;
  apiEndpoints?: number;
  crawlTime?: number;
  failedUrls?: FailedUrl[];
  errorSummary?: ErrorSummary;
  selectedNode?: SelectedNodeData;
}

export interface BreadcrumbItem {
  id: string;
  title: string;
  url: string;
}

export interface ExpandableSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}
