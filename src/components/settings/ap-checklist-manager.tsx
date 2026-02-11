"use client";

import { useState } from "react";
import {
  createApChecklistItem,
  updateApChecklistItem,
  deleteApChecklistItem,
} from "@/lib/actions/vendor-config";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ApChecklistItem {
  id: string;
  code: string;
  name: string;
  is_required: boolean;
  sort_order: number | null;
}

export function ApChecklistManager({ items }: { items: ApChecklistItem[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApChecklistItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRequired, setIsRequired] = useState(false);

  function openCreate() {
    setEditing(null);
    setIsRequired(false);
    setOpen(true);
  }

  function openEdit(item: ApChecklistItem) {
    setEditing(item);
    setIsRequired(item.is_required);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        code: form.get("code") as string,
        name: form.get("name") as string,
        is_required: isRequired,
      };

      if (editing) {
        await updateApChecklistItem(editing.id, data);
        toast.success("แก้ไขรายการเรียบร้อย");
      } else {
        await createApChecklistItem(data);
        toast.success("เพิ่มรายการเรียบร้อย");
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
    if (!confirm("ต้องการลบรายการนี้?")) return;
    try {
      await deleteApChecklistItem(id);
      toast.success("ลบรายการเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">AP Checklist ทั้งหมด ({items.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มรายการ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ลำดับ</TableHead>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อรายการ</TableHead>
              <TableHead>จำเป็น</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-mono">{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Badge variant={item.is_required ? "default" : "secondary"}>
                    {item.is_required ? "จำเป็น" : "ไม่จำเป็น"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มี Checklist
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขรายการ" : "เพิ่มรายการ"}</DialogTitle>
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_required"
                  checked={isRequired}
                  onCheckedChange={(v) => setIsRequired(v === true)}
                />
                <Label htmlFor="is_required" className="cursor-pointer">จำเป็น</Label>
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
