"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  created_at: string;
  table_name: string;
  action: string;
  record_id: string | null;
  changed_by: string | null;
  profiles: { full_name: string; email: string } | null;
}

const ACTION_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  INSERT: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
};

const ACTION_LABELS: Record<string, string> = {
  INSERT: "สร้าง",
  UPDATE: "แก้ไข",
  DELETE: "ลบ",
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AuditLogViewer({
  logs,
  totalCount,
}: {
  logs: AuditLog[];
  totalCount: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            บันทึกการใช้งาน ({totalCount.toLocaleString("th-TH")} รายการ)
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันเวลา</TableHead>
              <TableHead>ผู้ทำรายการ</TableHead>
              <TableHead>ตาราง</TableHead>
              <TableHead>การกระทำ</TableHead>
              <TableHead>Record ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </TableCell>
                <TableCell>
                  {log.profiles?.full_name || log.profiles?.email || "-"}
                </TableCell>
                <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANTS[log.action] || "outline"}>
                    {ACTION_LABELS[log.action] || log.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {log.record_id ? log.record_id.substring(0, 8) + "..." : "-"}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีบันทึก
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
