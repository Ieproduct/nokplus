"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processApproval } from "@/lib/actions/approval";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, RotateCcw, FileText, ShoppingCart, Receipt, Eye, Clock, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";
import Link from "next/link";
import { useHasPermission } from "@/components/permission-gate";

const DOC_TYPE_LABELS: Record<string, string> = {
  pr: "ใบขอซื้อ (PR)",
  po: "ใบสั่งซื้อ (PO)",
  ap: "ใบสำคัญจ่าย (AP)",
};

const DOC_TYPE_ICONS: Record<string, typeof FileText> = {
  pr: FileText,
  po: ShoppingCart,
  ap: Receipt,
};

const DOC_TYPE_COLORS: Record<string, string> = {
  pr: "bg-nok-blue/10 text-nok-blue",
  po: "bg-nok-success/10 text-nok-success",
  ap: "bg-purple-100 text-purple-600",
};

interface Approval {
  id: string;
  document_type: string;
  document_id: string;
  step: number;
  action: string | null;
  comment: string | null;
  created_at: string | null;
  profiles?: { full_name: string } | null;
  document?: {
    document_number: string;
    title: string;
    amount: number;
    department: string;
    created_at: string | null;
  } | null;
}

export function ApprovalList({ approvals }: { approvals: Approval[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const canProcess = useHasPermission("approval.process");

  const handleAction = async (
    approvalId: string,
    action: "approve" | "reject" | "revision"
  ) => {
    const comment = comments[approvalId] || "";
    if (action === "reject" && !comment.trim()) {
      toast.error("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }

    setLoading(approvalId);
    try {
      await processApproval(approvalId, action, comment || undefined);
      const actionLabels = {
        approve: "อนุมัติ",
        reject: "ปฏิเสธ",
        revision: "ส่งกลับแก้ไข",
      };
      toast.success(`${actionLabels[action]}สำเร็จ`);
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Check className="h-12 w-12 mb-3 text-nok-success/30" />
        <p className="text-lg font-medium text-nok-navy/50">ไม่มีรายการที่รออนุมัติ</p>
        <p className="text-sm">เอกสารทั้งหมดได้รับการดำเนินการแล้ว</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => {
        const Icon = DOC_TYPE_ICONS[approval.document_type] || FileText;
        const colorClass = DOC_TYPE_COLORS[approval.document_type] || "bg-gray-100 text-gray-600";
        const docLink = `/dashboard/${approval.document_type}/${approval.document_id}`;

        return (
          <div key={approval.id} className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            {/* Header: Document Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {DOC_TYPE_LABELS[approval.document_type] || approval.document_type}
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                    ขั้นตอนที่ {approval.step}
                  </Badge>
                </div>
                {approval.document ? (
                  <>
                    <Link href={docLink} className="text-base font-semibold text-nok-navy hover:text-nok-blue transition-colors">
                      {approval.document.document_number}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">{approval.document.title}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      {approval.document.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {approval.document.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(approval.document.created_at)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">เอกสาร ID: {approval.document_id.slice(0, 8)}...</p>
                )}
              </div>
              <div className="text-right shrink-0">
                {approval.document && approval.document.amount > 0 && (
                  <p className="text-lg font-bold text-nok-navy">{formatCurrency(approval.document.amount)}</p>
                )}
                <Link
                  href={docLink}
                  className="inline-flex items-center gap-1 text-xs text-nok-blue hover:underline mt-1"
                >
                  <Eye className="h-3 w-3" />
                  ดูเอกสาร
                </Link>
              </div>
            </div>

            {/* Action Area */}
            {canProcess && (
              <div className="flex items-end gap-3 pt-3 border-t">
                <div className="flex-1">
                  <Textarea
                    placeholder="ความคิดเห็น (จำเป็นเมื่อปฏิเสธ)"
                    value={comments[approval.id] || ""}
                    onChange={(e) =>
                      setComments({ ...comments, [approval.id]: e.target.value })
                    }
                    rows={2}
                    className="text-sm bg-muted/30"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-nok-success hover:bg-nok-success/90 shadow-sm"
                    onClick={() => handleAction(approval.id, "approve")}
                    disabled={loading === approval.id}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    อนุมัติ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => handleAction(approval.id, "revision")}
                    disabled={loading === approval.id}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(approval.id, "reject")}
                    disabled={loading === approval.id}
                  >
                    <X className="mr-1 h-4 w-4" />
                    ปฏิเสธ
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
