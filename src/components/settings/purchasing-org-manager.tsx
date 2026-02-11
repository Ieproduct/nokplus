"use client";

import { useState } from "react";
import {
  createPurchasingOrganization,
  updatePurchasingOrganization,
  deletePurchasingOrganization,
} from "@/lib/actions/purchasing-org";
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

interface PurchasingOrganization {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  parent_id: string | null;
}

export function PurchasingOrgManager({ organizations }: { organizations: PurchasingOrganization[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PurchasingOrganization | null>(null);
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState<string>("");

  function getParentName(parentId: string | null) {
    if (!parentId) return "-";
    const parent = organizations.find((o) => o.id === parentId);
    return parent ? parent.name : "-";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        code: form.get("code") as string,
        name: form.get("name") as string,
        name_en: form.get("name_en") as string,
        parent_id: parentId || undefined,
      };

      if (editing) {
        await updatePurchasingOrganization(editing.id, data);
        toast.success("แก้ไขหน่วยจัดซื้อเรียบร้อย");
      } else {
        await createPurchasingOrganization(data);
        toast.success("เพิ่มหน่วยจัดซื้อเรียบร้อย");
      }
      setOpen(false);
      setEditing(null);
      setParentId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบหน่วยจัดซื้อนี้?")) return;
    try {
      await deletePurchasingOrganization(id);
      toast.success("ลบหน่วยจัดซื้อเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  function openCreate() {
    setEditing(null);
    setParentId("");
    setOpen(true);
  }

  function openEdit(org: PurchasingOrganization) {
    setEditing(org);
    setParentId(org.parent_id || "");
    setOpen(true);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">หน่วยจัดซื้อทั้งหมด ({organizations.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มหน่วยจัดซื้อ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ชื่อ (EN)</TableHead>
              <TableHead>หน่วยงานแม่</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-mono">{org.code}</TableCell>
                <TableCell>{org.name}</TableCell>
                <TableCell className="text-muted-foreground">{org.name_en || "-"}</TableCell>
                <TableCell>{getParentName(org.parent_id)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(org)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(org.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีหน่วยจัดซื้อ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขหน่วยจัดซื้อ" : "เพิ่มหน่วยจัดซื้อ"}</DialogTitle>
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
              <div>
                <Label>หน่วยงานแม่</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหน่วยงานแม่ (ถ้ามี)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่มี</SelectItem>
                    {organizations
                      .filter((o) => o.id !== editing?.id)
                      .map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.code} - {o.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
