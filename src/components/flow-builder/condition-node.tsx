"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

interface ConditionData {
  label?: string;
  config?: {
    field?: string;
    operator?: string;
    value?: number;
  };
  [key: string]: unknown;
}

export function ConditionNode({ data }: NodeProps) {
  const d = data as ConditionData;

  return (
    <div className="relative flex h-20 w-40 items-center justify-center">
      <Handle type="target" position={Position.Top} className="!bg-yellow-600" />
      {/* Diamond shape */}
      <div className="absolute inset-0 rotate-45 rounded-lg border-2 border-yellow-400 bg-yellow-50 shadow-md" style={{ transform: "rotate(45deg) scale(0.7)" }} />
      <div className="relative z-10 text-center">
        <p className="text-xs font-medium">{d.label || "เงื่อนไข"}</p>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" className="!bg-green-500 !left-[30%]" />
      <Handle type="source" position={Position.Bottom} id="no" className="!bg-red-500 !left-[70%]" />
    </div>
  );
}
