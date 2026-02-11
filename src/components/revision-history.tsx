"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, History } from "lucide-react";

interface RevisionChange {
  old: any;
  new: any;
}

interface Revision {
  id: string;
  revision_number: number;
  changed_by: string;
  changed_at: string;
  changes_json: Record<string, RevisionChange>;
  reason: string | null;
  profiles?: { full_name: string | null } | null;
}

interface RevisionHistoryProps {
  revisions: Revision[];
}

const FIELD_LABELS: Record<string, string> = {
  title: "ชื่อเรื่อง",
  description: "รายละเอียด",
  department: "แผนก",
  cost_center: "ศูนย์ต้นทุน",
  status: "สถานะ",
  vendor_id: "ผู้ขาย",
  payment_term: "เงื่อนไขชำระ",
  wht_type: "ประเภท WHT",
  subtotal: "ยอดรวม",
  vat_amount: "VAT",
  wht_amount: "WHT",
  total_amount: "ยอดสุทธิ",
  net_payable: "ยอดชำระ",
  notes: "หมายเหตุ",
  priority: "ความสำคัญ",
  currency_code: "สกุลเงิน",
  exchange_rate: "อัตราแลกเปลี่ยน",
  incoterms: "Incoterms",
  delivery_address: "ที่อยู่จัดส่ง",
  gr_required: "ต้องการ GR",
  delivery_date: "วันที่ส่งมอบ",
  required_date: "วันที่ต้องการ",
  matching_status: "สถานะจับคู่",
};

function formatValue(value: any): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "ใช่" : "ไม่ใช่";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RevisionHistory({ revisions }: RevisionHistoryProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (revisions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
          ยังไม่มีประวัติการแก้ไข
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          ประวัติการแก้ไข ({revisions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {revisions.map((rev) => {
          const isOpen = expanded.has(rev.id);
          const changeCount = Object.keys(rev.changes_json).length;

          return (
            <div
              key={rev.id}
              className="border rounded-lg overflow-hidden"
            >
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto"
                onClick={() => toggleExpand(rev.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  <Badge variant="outline" className="shrink-0">
                    #{rev.revision_number}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {rev.profiles?.full_name || "ไม่ทราบ"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDate(rev.changed_at)} ({changeCount} การเปลี่ยนแปลง)
                  </span>
                </div>
              </Button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {rev.reason && (
                    <p className="text-sm text-muted-foreground italic mb-2">
                      เหตุผล: {rev.reason}
                    </p>
                  )}
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-2 font-medium">
                            ฟิลด์
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            ค่าเดิม
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            ค่าใหม่
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(rev.changes_json).map(
                          ([field, change]) => (
                            <tr key={field} className="border-t">
                              <td className="px-3 py-2 font-medium">
                                {FIELD_LABELS[field] || field}
                              </td>
                              <td className="px-3 py-2 text-red-600 line-through">
                                {formatValue(change.old)}
                              </td>
                              <td className="px-3 py-2 text-green-600">
                                {formatValue(change.new)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
