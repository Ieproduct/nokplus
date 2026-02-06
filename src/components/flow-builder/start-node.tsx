"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export function StartNode({ data }: NodeProps) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white text-xs font-medium shadow-md">
      <Handle type="source" position={Position.Bottom} className="!bg-green-700" />
      {(data as { label?: string }).label || "เริ่มต้น"}
    </div>
  );
}
