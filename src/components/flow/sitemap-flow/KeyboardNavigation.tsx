"use client";

import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useAppStore } from "@/lib/store";
import type { CustomNode, CustomEdge } from "@/types/flow";

interface KeyboardNavigationProps {
  nodes: CustomNode[];
  edges: CustomEdge[];
  onNodeSelect: (nodeId: string) => void;
}

export function KeyboardNavigation({ nodes, edges, onNodeSelect }: KeyboardNavigationProps) {
  const { setCenter, getNode } = useReactFlow();
  const { selectedNodeId, setSelectedNode, toggleNodeCollapse } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when not focused on an input
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      const currentNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight": {
          e.preventDefault();
          // Find children of current node
          if (currentNode) {
            const childEdges = edges.filter((edge) => edge.source === currentNode.id);
            if (childEdges.length > 0) {
              const firstChildId = childEdges[0].target;
              onNodeSelect(firstChildId);
              focusNode(firstChildId);
            } else {
              // No children, try to find next sibling
              const siblingId = findNextSibling(currentNode.id);
              if (siblingId) {
                onNodeSelect(siblingId);
                focusNode(siblingId);
              }
            }
          } else if (nodes.length > 0) {
            // No selection, select root
            const rootNode = nodes.find((n) => n.data.depth === 0) || nodes[0];
            onNodeSelect(rootNode.id);
            focusNode(rootNode.id);
          }
          break;
        }

        case "ArrowUp":
        case "ArrowLeft": {
          e.preventDefault();
          // Find parent of current node
          if (currentNode) {
            const parentEdge = edges.find((edge) => edge.target === currentNode.id);
            if (parentEdge) {
              onNodeSelect(parentEdge.source);
              focusNode(parentEdge.source);
            }
          }
          break;
        }

        case "Home": {
          e.preventDefault();
          // Go to root node
          const rootNode = nodes.find((n) => n.data.depth === 0);
          if (rootNode) {
            onNodeSelect(rootNode.id);
            focusNode(rootNode.id);
          }
          break;
        }

        case "End": {
          e.preventDefault();
          // Go to last node (deepest)
          const deepestNode = nodes.reduce(
            (prev, curr) => (curr.data.depth > prev.data.depth ? curr : prev),
            nodes[0]
          );
          if (deepestNode) {
            onNodeSelect(deepestNode.id);
            focusNode(deepestNode.id);
          }
          break;
        }

        case "Enter":
        case " ": {
          e.preventDefault();
          // Toggle collapse if node has children
          if (currentNode && currentNode.data.childCount > 0) {
            toggleNodeCollapse(currentNode.id);
          }
          break;
        }
      }
    };

    const findNextSibling = (nodeId: string): string | null => {
      // Find parent
      const parentEdge = edges.find((edge) => edge.target === nodeId);
      if (!parentEdge) return null;

      // Find all siblings (children of the same parent)
      const siblingEdges = edges.filter((edge) => edge.source === parentEdge.source);
      const currentIndex = siblingEdges.findIndex((edge) => edge.target === nodeId);

      // Get next sibling
      if (currentIndex < siblingEdges.length - 1) {
        return siblingEdges[currentIndex + 1].target;
      }
      return null;
    };

    const focusNode = (nodeId: string) => {
      const node = getNode(nodeId);
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 140) / 2;
        const y = node.position.y + (node.measured?.height ?? 50) / 2;
        setCenter(x, y, { zoom: 1, duration: 300 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nodes,
    edges,
    selectedNodeId,
    onNodeSelect,
    setSelectedNode,
    toggleNodeCollapse,
    getNode,
    setCenter,
  ]);

  return null;
}
