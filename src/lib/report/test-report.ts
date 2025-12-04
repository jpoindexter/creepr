/**
 * Quick test to verify markdown report generation
 * Run with: npx ts-node src/lib/report/test-report.ts
 */

import { generateMarkdownReport, ReportData, SourceLink } from './markdown-generator';
import { PageInfo } from '../crawler/types';

// Sample test data
const testCrawlResults: PageInfo[] = [
  {
    url: 'https://intellect.sh/',
    title: 'Intellect - AI Usage Documentation',
    statusCode: 200,
    links: [
      'https://intellect.sh/docs',
      'https://intellect.sh/old/docs',
      'https://intellect.sh/api/v1',
    ],
    depth: 0,
  },
  {
    url: 'https://intellect.sh/docs',
    title: 'Documentation',
    statusCode: 200,
    links: ['https://intellect.sh/', 'https://intellect.sh/docs/getting-started'],
    depth: 1,
    parentUrl: 'https://intellect.sh/',
  },
  {
    url: 'https://intellect.sh/old/docs',
    title: '',
    statusCode: 404,
    links: [],
    depth: 1,
    parentUrl: 'https://intellect.sh/',
    error: 'Page not found',
  },
  {
    url: 'https://intellect.sh/old/docs/advanced',
    title: '',
    statusCode: 404,
    links: [],
    depth: 2,
    parentUrl: 'https://intellect.sh/old/docs',
    error: 'Page not found',
  },
  {
    url: 'https://intellect.sh/old/docs/basic',
    title: '',
    statusCode: 404,
    links: [],
    depth: 2,
    parentUrl: 'https://intellect.sh/old/docs',
    error: 'Page not found',
  },
  {
    url: 'https://intellect.sh/api/v1',
    title: '',
    statusCode: 500,
    links: [],
    depth: 1,
    parentUrl: 'https://intellect.sh/',
    error: 'Internal server error',
  },
  {
    url: 'https://intellect.sh/api/v1/users/12345',
    title: '',
    statusCode: 404,
    links: [],
    depth: 2,
    parentUrl: 'https://intellect.sh/api/v1',
    error: 'User not found',
  },
  {
    url: 'https://intellect.sh/blog/Post-Title',
    title: '',
    statusCode: 404,
    links: [],
    depth: 1,
    parentUrl: 'https://intellect.sh/',
    error: 'Case sensitivity issue',
  },
];

const testSourceLinks: SourceLink[] = [
  {
    brokenUrl: 'https://intellect.sh/old/docs',
    referrerUrl: 'https://intellect.sh/',
    referrerTitle: 'Intellect - AI Usage Documentation',
  },
  {
    brokenUrl: 'https://intellect.sh/old/docs/advanced',
    referrerUrl: 'https://intellect.sh/old/docs',
    referrerTitle: 'Old Documentation',
  },
  {
    brokenUrl: 'https://intellect.sh/old/docs/advanced',
    referrerUrl: 'https://intellect.sh/docs',
    referrerTitle: 'Documentation',
  },
  {
    brokenUrl: 'https://intellect.sh/old/docs/basic',
    referrerUrl: 'https://intellect.sh/old/docs',
    referrerTitle: 'Old Documentation',
  },
  {
    brokenUrl: 'https://intellect.sh/api/v1',
    referrerUrl: 'https://intellect.sh/',
    referrerTitle: 'Intellect - AI Usage Documentation',
  },
  {
    brokenUrl: 'https://intellect.sh/api/v1/users/12345',
    referrerUrl: 'https://intellect.sh/api/v1',
    referrerTitle: 'API v1',
  },
  {
    brokenUrl: 'https://intellect.sh/blog/Post-Title',
    referrerUrl: 'https://intellect.sh/',
    referrerTitle: 'Intellect - AI Usage Documentation',
  },
];

// Generate report
const reportData: ReportData = {
  crawlResults: testCrawlResults,
  sourceLinks: testSourceLinks,
  baseUrl: 'https://intellect.sh',
  timestamp: new Date('2025-11-11T17:30:00Z'),
  crawlDuration: 12500, // 12.5 seconds
};

const markdown = generateMarkdownReport(reportData);

// Output
console.log('='.repeat(80));
console.log('MARKDOWN REPORT GENERATOR TEST');
console.log('='.repeat(80));
console.log();
console.log(markdown);
console.log();
console.log('='.repeat(80));
console.log('TEST COMPLETED SUCCESSFULLY');
console.log('='.repeat(80));

// Validate report structure
const sections = [
  '# 404 Audit Report',
  '## Executive Summary',
  '## Broken URLs by Category',
  '## Broken URLs by Error Type',
  '## Pattern Analysis',
  '## Fix Recommendations',
  '## Source References',
  '## Appendix: Full URL List',
];

let allSectionsPresent = true;
sections.forEach((section) => {
  if (!markdown.includes(section)) {
    console.error(`❌ Missing section: ${section}`);
    allSectionsPresent = false;
  }
});

if (allSectionsPresent) {
  console.log('✅ All sections present');
} else {
  console.log('❌ Some sections missing');
  process.exit(1);
}

// Validate key metrics
const expectations = [
  { text: 'Total Pages Crawled**: 8', description: 'Total pages count' },
  { text: 'Broken URLs Found**: 6', description: 'Broken URLs count' },
  { text: 'Health Score**: ', description: 'Health score present' },
  { text: 'Client Errors (4xx)**: 5', description: 'Client errors count' },
  { text: 'Server Errors (5xx)**: 1', description: 'Server errors count' },
];

let allMetricsValid = true;
expectations.forEach((exp) => {
  if (!markdown.includes(exp.text)) {
    console.error(`❌ Invalid metric: ${exp.description}`);
    allMetricsValid = false;
  }
});

if (allMetricsValid) {
  console.log('✅ All metrics valid');
} else {
  console.log('❌ Some metrics invalid');
  process.exit(1);
}

console.log();
console.log('🎉 ALL TESTS PASSED!');
