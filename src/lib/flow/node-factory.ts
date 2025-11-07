import { Node } from '@xyflow/react';
import { SitemapNode } from '@/types/sitemap';
import { CustomNodeData } from '@/types/flow';

export function createFlowNode(
  sitemapNode: SitemapNode,
  position: { x: number; y: number }
): Node<CustomNodeData> {
  const isRoot = sitemapNode.depth === 0;

  return {
    id: sitemapNode.id,
    type: 'custom',
    position,
    data: {
      label: sitemapNode.title,
      url: sitemapNode.url,
      statusCode: sitemapNode.statusCode,
      isBroken: sitemapNode.isBroken,
      depth: sitemapNode.depth,
      title: sitemapNode.title,
    },
    className: `${sitemapNode.isBroken ? 'broken' : ''} ${isRoot ? 'root' : ''}`,
  };
}
