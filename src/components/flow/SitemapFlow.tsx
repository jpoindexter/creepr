'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  FitViewOptions,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from './CustomNode';
import { CustomNode as CustomNodeType, CustomEdge } from '@/types/flow';
import { Download } from 'lucide-react';

interface SitemapFlowProps {
  nodes: CustomNodeType[];
  edges: CustomEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export function SitemapFlow({ nodes: initialNodes, edges: initialEdges, onNodeClick }: SitemapFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when props change
  useMemo(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useMemo(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: CustomNodeType) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  const handleDownload = useCallback(() => {
    // Export as JSON
    const data = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitemap-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isBroken) return '#ef4444';
            if (node.data?.depth === 0) return '#3b82f6';
            return '#94a3b8';
          }}
          className="!bg-white !border-2 !border-gray-300"
        />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={handleDownload}
            className="bg-white px-3 py-2 rounded-lg border-2 border-gray-300 shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
