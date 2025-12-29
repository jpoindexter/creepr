"use client";

import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useAppStore } from "@/lib/store";

export function ZoomToSelection() {
  const { setCenter, getNode } = useReactFlow();
  const { selectedNodeId } = useAppStore();

  useEffect(() => {
    if (!selectedNodeId) return;

    const node = getNode(selectedNodeId);
    if (!node) return;

    // Calculate the center of the node
    const x = node.position.x + (node.measured?.width ?? 140) / 2;
    const y = node.position.y + (node.measured?.height ?? 50) / 2;

    // Smoothly center on the selected node
    setCenter(x, y, { zoom: 1, duration: 500 });
  }, [selectedNodeId, setCenter, getNode]);

  return null;
}
