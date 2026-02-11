"use client";

import { useState } from "react";
import {
  createApprovalDelegation,
  updateApprovalDelegation,
  deleteApprovalDelegation,
} from "@/lib/actions/delegation";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  role: string;
  profiles: { full_name: string; email: string } | null;
}

interface Delegation {
  id: string;
  delegator_id: string;
  delegate_id: string;
  start_date: string;
  end_date: string;
  max_amount: number | null;
  reason: string | null;
  delegator: Member | null;
  delegate: Member | null;
}

function getMemberName(member: Member | null): string {
  if (!member) return "-";
  return member.profiles?.full_name || member.profiles?.email || "-";
}

function isExpired(endDate: string): boolean {
  return new Date(endDate) < new Date();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "ไม่จำกัด";
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

export function DelegationManager({
  delegations,
  members,
}: {
  delegations: Delegation[];
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Delegation | null>(null);
  const [loading, setLoading] = useState(false);
  const [delegatorId, setDelegatorId] = useState<string>("");
  const [delegateId, setDelegateId] = useState<string>("");

  function openCreate() {
    setEditing(null);
    setDelegatorId("");
    setDelegateId("");
    setOpen(true);
  }

  function openEdit(delegation: Delegation) {
    setEditing(delegation);
    setDelegatorId(delegation.delegator_id);
    setDelegateId(delegation.delegate_id);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const maxAmountStr = form.get("max_amount") as string;

      if (editing) {
        const data = {
          start_date: form.get("start_date") as string,
          end_date: form.get("end_date") as string,
          max_amount: maxAmountStr ? parseFloat(maxAmountStr) : undefined,
          reason: (form.get("reason") as string) || undefined,
        };
        await updateApprovalDelegation(editing.id, data);
        toast.success("แก้ไขการมอบอำนาจเรียบร้อย");
      } else {
        if (!delegatorId || !delegateId) {
          toast.error("กรุณาเลือกผู้มอบอำนาจและผู้รับมอบ");
          setLoading(false);
          return;
        }
        const data = {
          delegator_id: delegatorId,
          delegate_id: delegateId,
          start_date: form.get("start_date") as string,
          end_date: form.get("end_date") as string,
          max_amount: maxAmountStr ? parseFloat(maxAmountStr) : undefined,
          reason: (form.get("reason") as string) || undefined,
        };
        await createApprovalDelegation(data);
        toast.success("เพิ่มการมอบอำนาจเรียบร้อย");
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบการมอบอำนาจนี้?")) return;
    try {
      await deleteApprovalDelegation(id);
      toast.success("ลบการมอบอำนาจเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">การมอบอำนาจทั้งหมด ({delegations.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มการมอบอำนาจ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้มอบอำนาจ</TableHead>
              <TableHead>ผู้รับมอบ</TableHead>
              <TableHead>ช่วงวันที่</TableHead>
              <TableHead className="text-right">วงเงิน</TableHead>
              <TableHead>เหตุผล</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delegations.map((d) => (
              <TableRow
                key={d.id}
                className={isExpired(d.end_date) ? "opacity-50" : ""}
              >
                <TableCell>{getMemberName(d.delegator)}</TableCell>
                <TableCell>{getMemberName(d.delegate)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(d.start_date)} - {formatDate(d.end_date)}
                  </div>
                  {isExpired(d.end_date) && (
                    <div className="text-xs text-destructive">หมดอายุแล้ว</div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatAmount(d.max_amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">{d.reason || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {delegations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  ยังไม่มีการมอบอำนาจ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "แก้ไขการมอบอำนาจ" : "เพิ่มการมอบอำนาจ"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <>
                  <div>
                    <Label>ผู้มอบอำนาจ *</Label>
                    <Select value={delegatorId} onValueChange={setDelegatorId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกผู้มอบอำนาจ" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {getMemberName(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ผู้รับมอบ *</Label>
                    <Select value={delegateId} onValueChange={setDelegateId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกผู้รับมอบ" />
                      </SelectTrigger>
                      <SelectContent>
                        {members
                          .filter((m) => m.id !== delegatorId)
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {getMemberName(m)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">วันเริ่ม *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={editing?.start_date || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">วันสิ้นสุด *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    defaultValue={editing?.end_date || ""}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max_amount">วงเงินสูงสุด (บาท)</Label>
                <Input
                  id="max_amount"
                  name="max_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing?.max_amount ?? ""}
                  placeholder="ว่างไว้ = ไม่จำกัด"
                />
              </div>
              <div>
                <Label htmlFor="reason">เหตุผล</Label>
                <Input
                  id="reason"
                  name="reason"
                  defaultValue={editing?.reason || ""}
                  placeholder="เช่น ลาพักร้อน"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
