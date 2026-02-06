"use client";

import { useState } from "react";
import { createCostCenter, updateCostCenter, deleteCostCenter } from "@/lib/actions/department";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CostCenter {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  is_active: boolean;
}

export function CostCenterManager({ costCenters }: { costCenters: CostCenter[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenter | null>(null);
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
        await updateCostCenter(editing.id, data);
        toast.success("แก้ไข Cost Center เรียบร้อย");
      } else {
        await createCostCenter(data);
        toast.success("เพิ่ม Cost Center เรียบร้อย");
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
    if (!confirm("ต้องการลบ Cost Center นี้?")) return;
    try {
      await deleteCostCenter(id);
      toast.success("ลบ Cost Center เรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Cost Center ทั้งหมด ({costCenters.length})</h3>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่ม Cost Center
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ชื่อ (EN)</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters.map((cc) => (
              <TableRow key={cc.id}>
                <TableCell className="font-mono">{cc.code}</TableCell>
                <TableCell>{cc.name}</TableCell>
                <TableCell className="text-muted-foreground">{cc.name_en || "-"}</TableCell>
                <TableCell>
                  <Badge variant={cc.is_active ? "default" : "secondary"}>
                    {cc.is_active ? "ใช้งาน" : "ปิด"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(cc); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {costCenters.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มี Cost Center
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไข Cost Center" : "เพิ่ม Cost Center"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cc_code">รหัส *</Label>
                <Input id="cc_code" name="code" defaultValue={editing?.code || ""} required disabled={!!editing} />
              </div>
              <div>
                <Label htmlFor="cc_name">ชื่อ *</Label>
                <Input id="cc_name" name="name" defaultValue={editing?.name || ""} required />
              </div>
              <div>
                <Label htmlFor="cc_name_en">ชื่อ (EN)</Label>
                <Input id="cc_name_en" name="name_en" defaultValue={editing?.name_en || ""} />
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
