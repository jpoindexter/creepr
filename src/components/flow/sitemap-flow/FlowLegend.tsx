"use client";

import { Panel } from "@xyflow/react";

export function FlowLegend() {
  return (
    <Panel
      position="bottom-left"
      style={{ background: "#FFFFFF", border: "1px solid #E0E0E0", padding: "8px 12px" }}
    >
      <div className="text-foreground/60 flex gap-4 font-mono text-[10px]">
        <span>
          <span className="mr-1 inline-block h-2 w-2" style={{ background: "#0A0A0A" }} /> Root
        </span>
        <span>
          <span
            className="mr-1 inline-block h-2 w-2"
            style={{ background: "#1A1A1A", border: "1px solid #333333" }}
          />{" "}
          Page
        </span>
        <span>
          <span
            className="mr-1 inline-block h-2 w-2"
            style={{ background: "#666666", border: "1px solid #888888" }}
          />{" "}
          Error
        </span>
      </div>
    </Panel>
  );
}
