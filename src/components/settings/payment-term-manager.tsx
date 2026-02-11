"use client";

import { useState } from "react";
import { createPaymentTerm, updatePaymentTerm, deletePaymentTerm } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentTerm {
  id: string;
  code: string;
  name: string;
  days: number;
  discount_percent: number | null;
  description: string | null;
}

export function PaymentTermManager({ terms }: { terms: PaymentTerm[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentTerm | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        code: form.get("code") as string,
        name: form.get("name") as string,
        days: parseInt(form.get("days") as string, 10),
        discount_percent: form.get("discount_percent")
          ? parseFloat(form.get("discount_percent") as string)
          : undefined,
        description: (form.get("description") as string) || undefined,
      };

      if (editing) {
        await updatePaymentTerm(editing.id, data);
        toast.success("แก้ไขเงื่อนไขชำระเรียบร้อย");
      } else {
        await createPaymentTerm(data);
        toast.success("เพิ่มเงื่อนไขชำระเรียบร้อย");
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
    if (!confirm("ต้องการลบเงื่อนไขชำระนี้?")) return;
    try {
      await deletePaymentTerm(id);
      toast.success("ลบเงื่อนไขชำระเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">เงื่อนไขชำระทั้งหมด ({terms.length})</h3>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มเงื่อนไขชำระ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead className="text-right">จำนวนวัน</TableHead>
              <TableHead className="text-right">ส่วนลด (%)</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono">{t.code}</TableCell>
                <TableCell>{t.name}</TableCell>
                <TableCell className="text-right">{t.days}</TableCell>
                <TableCell className="text-right">
                  {t.discount_percent != null ? `${t.discount_percent}%` : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {terms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีเงื่อนไขชำระ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขเงื่อนไขชำระ" : "เพิ่มเงื่อนไขชำระ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">รหัส *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="เช่น NET30"
                  defaultValue={editing?.code || ""}
                  required
                  disabled={!!editing}
                />
              </div>
              <div>
                <Label htmlFor="name">ชื่อ *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="เช่น ชำระภายใน 30 วัน"
                  defaultValue={editing?.name || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="days">จำนวนวัน *</Label>
                <Input
                  id="days"
                  name="days"
                  type="number"
                  min="0"
                  defaultValue={editing?.days ?? 30}
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount_percent">ส่วนลด (%)</Label>
                <Input
                  id="discount_percent"
                  name="discount_percent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={editing?.discount_percent ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing?.description || ""}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
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
