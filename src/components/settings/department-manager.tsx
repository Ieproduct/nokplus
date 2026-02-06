"use client";

import { useState } from "react";
import { createDepartment, updateDepartment, deleteDepartment } from "@/lib/actions/department";
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

interface Department {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  default_cost_center: string | null;
  is_active: boolean;
}

export function DepartmentManager({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
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
        default_cost_center: form.get("default_cost_center") as string,
      };

      if (editing) {
        await updateDepartment(editing.id, data);
        toast.success("แก้ไขแผนกเรียบร้อย");
      } else {
        await createDepartment(data);
        toast.success("เพิ่มแผนกเรียบร้อย");
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
    if (!confirm("ต้องการลบแผนกนี้?")) return;
    try {
      await deleteDepartment(id);
      toast.success("ลบแผนกเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">แผนกทั้งหมด ({departments.length})</h3>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มแผนก
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ชื่อ (EN)</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-mono">{dept.code}</TableCell>
                <TableCell>{dept.name}</TableCell>
                <TableCell className="text-muted-foreground">{dept.name_en || "-"}</TableCell>
                <TableCell>{dept.default_cost_center || "-"}</TableCell>
                <TableCell>
                  <Badge variant={dept.is_active ? "default" : "secondary"}>
                    {dept.is_active ? "ใช้งาน" : "ปิด"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(dept); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {departments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  ยังไม่มีแผนก
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขแผนก" : "เพิ่มแผนก"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">รหัสแผนก *</Label>
                <Input id="code" name="code" defaultValue={editing?.code || ""} required disabled={!!editing} />
              </div>
              <div>
                <Label htmlFor="name">ชื่อแผนก *</Label>
                <Input id="name" name="name" defaultValue={editing?.name || ""} required />
              </div>
              <div>
                <Label htmlFor="name_en">ชื่อแผนก (EN)</Label>
                <Input id="name_en" name="name_en" defaultValue={editing?.name_en || ""} />
              </div>
              <div>
                <Label htmlFor="default_cost_center">Cost Center เริ่มต้น</Label>
                <Input id="default_cost_center" name="default_cost_center" defaultValue={editing?.default_cost_center || ""} />
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
