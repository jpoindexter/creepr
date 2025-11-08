import { Edge } from "@xyflow/react";
import { CustomEdgeData } from "@/types/flow";

export function createFlowEdge(
  sourceId: string,
  targetId: string,
  isBroken: boolean
): Edge<CustomEdgeData> {
  return {
    id: `${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: "smoothstep",
    animated: false,
    data: {
      isBroken,
    },
    className: isBroken ? "broken" : "",
    style: {
      stroke: isBroken ? "#ef4444" : "#94a3b8",
      strokeWidth: 2,
    },
  };
}
