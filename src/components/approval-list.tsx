"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processApproval } from "@/lib/actions/approval";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const DOC_TYPE_LABELS: Record<string, string> = {
  pr: "ใบขอซื้อ (PR)",
  po: "ใบสั่งซื้อ (PO)",
  ap: "ใบสำคัญจ่าย (AP)",
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
}

export function ApprovalList({ approvals }: { approvals: Approval[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

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

  if (approvals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ไม่มีรายการที่รออนุมัติ
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <Card key={approval.id} className="border">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Badge variant="outline">
                  {DOC_TYPE_LABELS[approval.document_type] || approval.document_type}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  ขั้นตอนที่ {approval.step}
                </p>
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="ความคิดเห็น (จำเป็นเมื่อปฏิเสธ)"
                  value={comments[approval.id] || ""}
                  onChange={(e) =>
                    setComments({ ...comments, [approval.id]: e.target.value })
                  }
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(approval.id, "approve")}
                  disabled={loading === approval.id}
                >
                  <Check className="mr-1 h-4 w-4" />
                  อนุมัติ
                </Button>
                <Button
                  size="sm"
                  variant="outline"
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
