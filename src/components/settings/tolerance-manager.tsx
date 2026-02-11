"use client";

import { useState } from "react";
import {
  createToleranceGroup,
  updateToleranceGroup,
  deleteToleranceGroup,
} from "@/lib/actions/finance";
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

interface ToleranceGroup {
  id: string;
  name: string;
  description: string | null;
  price_variance_percent: number | null;
  quantity_variance_percent: number | null;
  amount_tolerance: number | null;
}

export function ToleranceManager({ groups }: { groups: ToleranceGroup[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ToleranceGroup | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        name: form.get("name") as string,
        description: (form.get("description") as string) || undefined,
        price_variance_percent: parseFloat(form.get("price_variance_percent") as string),
        quantity_variance_percent: parseFloat(form.get("quantity_variance_percent") as string),
        amount_tolerance: parseFloat(form.get("amount_tolerance") as string),
      };

      if (editing) {
        await updateToleranceGroup(editing.id, data);
        toast.success("แก้ไขกลุ่มค่าเผื่อเรียบร้อย");
      } else {
        await createToleranceGroup(data);
        toast.success("เพิ่มกลุ่มค่าเผื่อเรียบร้อย");
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
    if (!confirm("ต้องการลบกลุ่มค่าเผื่อนี้?")) return;
    try {
      await deleteToleranceGroup(id);
      toast.success("ลบกลุ่มค่าเผื่อเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">กลุ่มค่าเผื่อทั้งหมด ({groups.length})</h3>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มกลุ่มค่าเผื่อ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead className="text-right">% ราคา</TableHead>
              <TableHead className="text-right">% จำนวน</TableHead>
              <TableHead className="text-right">วงเงิน</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.name}</TableCell>
                <TableCell className="text-right font-mono">{g.price_variance_percent ?? 0}%</TableCell>
                <TableCell className="text-right font-mono">{g.quantity_variance_percent ?? 0}%</TableCell>
                <TableCell className="text-right font-mono">
                  {(g.amount_tolerance ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(g); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีกลุ่มค่าเผื่อ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขกลุ่มค่าเผื่อ" : "เพิ่มกลุ่มค่าเผื่อ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">ชื่อ *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="เช่น ค่าเผื่อทั่วไป"
                  defaultValue={editing?.name || ""}
                  required
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
              <div>
                <Label htmlFor="price_variance_percent">% ราคา *</Label>
                <Input
                  id="price_variance_percent"
                  name="price_variance_percent"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing?.price_variance_percent ?? 5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity_variance_percent">% จำนวน *</Label>
                <Input
                  id="quantity_variance_percent"
                  name="quantity_variance_percent"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing?.quantity_variance_percent ?? 10}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount_tolerance">วงเงิน (บาท) *</Label>
                <Input
                  id="amount_tolerance"
                  name="amount_tolerance"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing?.amount_tolerance ?? 100}
                  required
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
