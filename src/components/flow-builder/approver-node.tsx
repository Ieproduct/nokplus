"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { User } from "lucide-react";

interface ApproverData {
  label?: string;
  config?: {
    approval_level?: number;
    max_amount?: number | null;
  };
  [key: string]: unknown;
}

export function ApproverNode({ data }: NodeProps) {
  const d = data as ApproverData;
  const maxAmount = d.config?.max_amount;

  return (
    <div className="min-w-[160px] rounded-lg border-2 border-blue-300 bg-white px-4 py-3 shadow-md">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex items-center gap-2 mb-1">
        <User className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">{d.label || "ผู้อนุมัติ"}</span>
      </div>
      {d.config?.approval_level && (
        <p className="text-xs text-muted-foreground">Level {d.config.approval_level}</p>
      )}
      {maxAmount && (
        <p className="text-xs text-muted-foreground">
          สูงสุด {new Intl.NumberFormat("th-TH").format(maxAmount)} บาท
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
}
