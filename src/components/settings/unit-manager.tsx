"use client";

import { useState } from "react";
import { createUnit, updateUnit, deleteUnit } from "@/lib/actions/document-config";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Unit {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
}

export function UnitManager({ units }: { units: Unit[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        code: form.get("code") as string,
        name: form.get("name") as string,
        name_en: form.get("name_en") as string,
      };

      if (editing) {
        await updateUnit(editing.id, data);
        toast.success("แก้ไขหน่วยนับเรียบร้อย");
      } else {
        await createUnit(data);
        toast.success("เพิ่มหน่วยนับเรียบร้อย");
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
    if (!confirm("ต้องการลบหน่วยนับนี้?")) return;
    try {
      await deleteUnit(id);
      toast.success("ลบหน่วยนับเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">หน่วยนับทั้งหมด ({units.length})</h3>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มหน่วยนับ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ชื่อ (EN)</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-mono">{unit.code}</TableCell>
                <TableCell>{unit.name}</TableCell>
                <TableCell className="text-muted-foreground">{unit.name_en || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(unit); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(unit.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  ยังไม่มีหน่วยนับ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขหน่วยนับ" : "เพิ่มหน่วยนับ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">รหัส *</Label>
                <Input id="code" name="code" defaultValue={editing?.code || ""} required disabled={!!editing} />
              </div>
              <div>
                <Label htmlFor="name">ชื่อ *</Label>
                <Input id="name" name="name" defaultValue={editing?.name || ""} required />
              </div>
              <div>
                <Label htmlFor="name_en">ชื่อ EN</Label>
                <Input id="name_en" name="name_en" defaultValue={editing?.name_en || ""} />
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
