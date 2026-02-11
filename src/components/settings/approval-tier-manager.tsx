"use client";

import { useState } from "react";
import {
  createApprovalTier,
  updateApprovalTier,
  deleteApprovalTier,
  type ApprovalTier,
} from "@/lib/actions/flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const DOC_TYPES = [
  { value: "pr", label: "ใบขอซื้อ (PR)" },
  { value: "po", label: "ใบสั่งซื้อ (PO)" },
  { value: "ap", label: "ใบสำคัญจ่าย (AP)" },
] as const;

const DOC_TYPE_LABELS: Record<string, string> = {
  pr: "ใบขอซื้อ (PR)",
  po: "ใบสั่งซื้อ (PO)",
  ap: "ใบสำคัญจ่าย (AP)",
};

interface ApproverEntry {
  user_id: string;
  label: string;
}

export function ApprovalTierManager({
  tiers,
  members,
}: {
  tiers: ApprovalTier[];
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<ApprovalTier | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [docType, setDocType] = useState<"pr" | "po" | "ap">("pr");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [approvers, setApprovers] = useState<ApproverEntry[]>([]);

  function resetForm() {
    setDocType("pr");
    setMinAmount("");
    setMaxAmount("");
    setApprovers([]);
    setEditingTier(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(tier: ApprovalTier) {
    setEditingTier(tier);
    setDocType(tier.document_type as "pr" | "po" | "ap");
    setMinAmount(tier.min_amount.toString());
    setMaxAmount(tier.max_amount.toString());
    setApprovers(
      tier.approvers.map((a) => ({ user_id: a.user_id, label: a.label }))
    );
    setOpen(true);
  }

  function addApprover() {
    setApprovers([...approvers, { user_id: "", label: "" }]);
  }

  function removeApprover(index: number) {
    setApprovers(approvers.filter((_, i) => i !== index));
  }

  function setApproverUser(index: number, userId: string) {
    const member = members.find((m) => m.user_id === userId);
    const label = member?.profiles?.full_name || "";
    setApprovers(
      approvers.map((a, i) => (i === index ? { user_id: userId, label } : a))
    );
  }

  function validateOverlap(): string | null {
    const min = Number(minAmount);
    const max = Number(maxAmount);
    if (!min || !max || min > max) {
      return "วงเงินขั้นต่ำต้องน้อยกว่าหรือเท่ากับวงเงินสูงสุด";
    }

    // ตรวจสอบช่วงเงินซ้อนกัน
    const otherTiers = tiers.filter(
      (t) => t.document_type === docType && t.id !== editingTier?.id
    );
    for (const t of otherTiers) {
      if (min <= t.max_amount && max >= t.min_amount) {
        return `ช่วงเงินซ้อนกับวงเงิน ${t.min_amount.toLocaleString()}-${t.max_amount.toLocaleString()}`;
      }
    }
    return null;
  }

  async function handleSubmit() {
    if (approvers.length === 0 || approvers.some((a) => !a.user_id)) {
      toast.error("ต้องเลือกผู้อนุมัติอย่างน้อย 1 คน");
      return;
    }

    const overlapError = validateOverlap();
    if (overlapError) {
      toast.error(overlapError);
      return;
    }

    setLoading(true);
    try {
      if (editingTier) {
        await updateApprovalTier(editingTier.id, {
          min_amount: Number(minAmount),
          max_amount: Number(maxAmount),
          approvers,
        });
        toast.success("แก้ไขวงเงินเรียบร้อย");
      } else {
        await createApprovalTier({
          document_type: docType,
          min_amount: Number(minAmount),
          max_amount: Number(maxAmount),
          approvers,
        });
        toast.success("สร้างวงเงินเรียบร้อย");
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(tierId: string) {
    if (!confirm("ต้องการลบวงเงินนี้?")) return;
    try {
      await deleteApprovalTier(tierId);
      toast.success("ลบวงเงินเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  // จัดกลุ่มตาม document_type
  const grouped = DOC_TYPES.map((dt) => ({
    ...dt,
    tiers: tiers.filter((t) => t.document_type === dt.value),
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          กำหนดวงเงินอนุมัติแยกตามประเภทเอกสาร เมื่อส่งเอกสารอนุมัติระบบจะเลือก flow ตามยอดเงินอัตโนมัติ
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> เพิ่มวงเงิน
        </Button>
      </div>

      {grouped.map((group) => (
        <Card key={group.value} className="shadow-sm">
          <CardHeader className="py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm font-medium">{group.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {group.tiers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วงเงิน (บาท)</TableHead>
                    <TableHead>ผู้อนุมัติ</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.tiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-mono text-sm">
                        {tier.min_amount.toLocaleString()} - {tier.max_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {tier.approvers.map((a, i) => (
                            <span key={a.node_id} className="flex items-center gap-1">
                              <span className="text-sm">{a.label}</span>
                              {i < tier.approvers.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                          ))}
                          {tier.approvers.length === 0 && (
                            <span className="text-muted-foreground text-sm">ยังไม่มีผู้อนุมัติ</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(tier)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(tier.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                ยังไม่มีวงเงินอนุมัติ
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? "แก้ไขวงเงินอนุมัติ" : "เพิ่มวงเงินอนุมัติ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ประเภทเอกสาร</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as "pr" | "po" | "ap")}
                disabled={!!editingTier}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>วงเงินขั้นต่ำ (บาท)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="5,000"
                />
              </div>
              <div>
                <Label>วงเงินสูงสุด (บาท)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="49,999"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>ผู้อนุมัติตามลำดับ</Label>
                <Button type="button" variant="outline" size="sm" onClick={addApprover}>
                  <Plus className="h-3 w-3 mr-1" /> เพิ่ม
                </Button>
              </div>
              {approvers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3 border rounded-md border-dashed">
                  กดปุ่ม &quot;เพิ่ม&quot; เพื่อเลือกผู้อนุมัติ
                </p>
              )}
              <div className="space-y-2">
                {approvers.map((approver, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">
                      {index + 1}.
                    </span>
                    <Select
                      value={approver.user_id}
                      onValueChange={(v) => setApproverUser(index, v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="เลือกผู้อนุมัติ" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            {m.profiles?.full_name || m.profiles?.email || m.user_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeApprover(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                ยกเลิก
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "กำลังบันทึก..." : editingTier ? "บันทึก" : "สร้าง"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
