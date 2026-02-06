"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export function EndNode({ data }: NodeProps) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium shadow-md">
      <Handle type="target" position={Position.Top} className="!bg-red-700" />
      {(data as { label?: string }).label || "อนุมัติ"}
    </div>
  );
}
