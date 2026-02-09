"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { User, UserCheck } from "lucide-react";

interface ApproverData {
  label?: string;
  user_id?: string | null;
  user_name?: string;
  config?: {
    approval_level?: number;
    max_amount?: number | null;
  };
  [key: string]: unknown;
}

export function ApproverNode({ data }: NodeProps) {
  const d = data as ApproverData;
  const maxAmount = d.config?.max_amount;
  const hasUser = !!d.user_id;

  return (
    <div className={`min-w-[160px] rounded-lg border-2 ${hasUser ? "border-green-400" : "border-blue-300"} bg-white px-4 py-3 shadow-md cursor-pointer`}>
      <Handle type="target" position={Position.Top} className={hasUser ? "!bg-green-500" : "!bg-blue-500"} />
      <div className="flex items-center gap-2 mb-1">
        {hasUser ? (
          <UserCheck className="h-4 w-4 text-green-600" />
        ) : (
          <User className="h-4 w-4 text-blue-500" />
        )}
        <span className="text-sm font-medium">{d.label || "ผู้อนุมัติ"}</span>
      </div>
      {d.user_name && (
        <p className="text-xs text-green-700 font-medium">{d.user_name}</p>
      )}
      {d.config?.approval_level && (
        <p className="text-xs text-muted-foreground">Level {d.config.approval_level}</p>
      )}
      {maxAmount && (
        <p className="text-xs text-muted-foreground">
          สูงสุด {new Intl.NumberFormat("th-TH").format(maxAmount)} บาท
        </p>
      )}
      {!hasUser && !d.config?.approval_level && (
        <p className="text-xs text-orange-500">ดับเบิลคลิกเพื่อเลือกผู้อนุมัติ</p>
      )}
      <Handle type="source" position={Position.Bottom} className={hasUser ? "!bg-green-500" : "!bg-blue-500"} />
    </div>
  );
}
