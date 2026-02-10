"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApprovalFlow, deleteApprovalFlow, updateApprovalFlow } from "@/lib/actions/flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface Flow {
  id: string;
  name: string;
  document_type: string;
  is_default: boolean;
  is_active: boolean;
  auto_escalate?: boolean;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  pr: "ใบขอซื้อ (PR)",
  po: "ใบสั่งซื้อ (PO)",
  ap: "ใบสำคัญจ่าย (AP)",
};

export function ApprovalFlowList({ flows }: { flows: Flow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoEscalate, setAutoEscalate] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const result = await createApprovalFlow({
        name: form.get("name") as string,
        document_type: form.get("document_type") as "pr" | "po" | "ap",
        auto_escalate: autoEscalate,
      });
      toast.success("สร้าง Flow เรียบร้อย");
      setOpen(false);
      router.push(`/dashboard/settings/approvals/${result.id}/builder`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetDefault(flowId: string) {
    try {
      await updateApprovalFlow(flowId, { is_default: true });
      toast.success("ตั้งเป็น Flow เริ่มต้นเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleDelete(flowId: string) {
    if (!confirm("ต้องการลบ Flow นี้?")) return;
    try {
      await deleteApprovalFlow(flowId);
      toast.success("ลบ Flow เรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">ลำดับอนุมัติ ({flows.length})</h3>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> สร้าง Flow ใหม่
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ประเภทเอกสาร</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell className="font-medium">
                  {flow.name}
                  {flow.is_default && (
                    <Badge variant="secondary" className="ml-2">ค่าเริ่มต้น</Badge>
                  )}
                </TableCell>
                <TableCell>{DOC_TYPE_LABELS[flow.document_type] || flow.document_type}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant={flow.is_active ? "default" : "secondary"}>
                      {flow.is_active ? "ใช้งาน" : "ปิด"}
                    </Badge>
                    {flow.auto_escalate && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Auto-Escalate
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!flow.is_default && (
                      <Button variant="ghost" size="icon" title="ตั้งเป็นค่าเริ่มต้น" onClick={() => handleSetDefault(flow.id)}>
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/settings/approvals/${flow.id}/builder`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(flow.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {flows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  ยังไม่มี Flow อนุมัติ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setAutoEscalate(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้าง Approval Flow ใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="flow_name">ชื่อ Flow *</Label>
                <Input id="flow_name" name="name" required placeholder="เช่น ลำดับอนุมัติ PR สำนักงานใหญ่" />
              </div>
              <div>
                <Label htmlFor="flow_doc_type">ประเภทเอกสาร *</Label>
                <Select name="document_type" defaultValue="pr">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pr">ใบขอซื้อ (PR)</SelectItem>
                    <SelectItem value="po">ใบสั่งซื้อ (PO)</SelectItem>
                    <SelectItem value="ap">ใบสำคัญจ่าย (AP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto_escalate"
                  checked={autoEscalate}
                  onCheckedChange={(v) => setAutoEscalate(v === true)}
                />
                <Label htmlFor="auto_escalate" className="text-sm font-normal cursor-pointer">
                  Auto-Escalate (สร้าง chain อัตโนมัติตามระดับองค์กร)
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "กำลังสร้าง..." : "สร้างและออกแบบ"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
