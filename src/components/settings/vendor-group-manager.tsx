"use client";

import { useState } from "react";
import {
  createVendorGroup,
  updateVendorGroup,
  deleteVendorGroup,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface VendorGroup {
  id: string;
  code: string;
  name: string;
  description: string | null;
  default_payment_term: string | null;
  default_wht_type: string | null;
}

const WHT_LABELS: Record<string, string> = {
  none: "ไม่มี",
  service: "บริการ (3%)",
  rent: "ค่าเช่า (5%)",
  transport: "ขนส่ง (1%)",
};

export function VendorGroupManager({ groups }: { groups: VendorGroup[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VendorGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [whtType, setWhtType] = useState<string>("none");

  function openCreate() {
    setEditing(null);
    setWhtType("none");
    setOpen(true);
  }

  function openEdit(group: VendorGroup) {
    setEditing(group);
    setWhtType(group.default_wht_type || "none");
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
        description: (form.get("description") as string) || undefined,
        default_payment_term: (form.get("default_payment_term") as string) || undefined,
        default_wht_type: whtType,
      };

      if (editing) {
        await updateVendorGroup(editing.id, data);
        toast.success("แก้ไขกลุ่มผู้ขายเรียบร้อย");
      } else {
        await createVendorGroup(data);
        toast.success("เพิ่มกลุ่มผู้ขายเรียบร้อย");
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
    if (!confirm("ต้องการลบกลุ่มผู้ขายนี้?")) return;
    try {
      await deleteVendorGroup(id);
      toast.success("ลบกลุ่มผู้ขายเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">กลุ่มผู้ขายทั้งหมด ({groups.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มกลุ่มผู้ขาย
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead>เงื่อนไขชำระ</TableHead>
              <TableHead>WHT</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-mono">{group.code}</TableCell>
                <TableCell>{group.name}</TableCell>
                <TableCell className="text-muted-foreground">{group.description || "-"}</TableCell>
                <TableCell>{group.default_payment_term || "-"}</TableCell>
                <TableCell>
                  {group.default_wht_type && group.default_wht_type !== "none" ? (
                    <Badge variant="secondary">
                      {WHT_LABELS[group.default_wht_type] || group.default_wht_type}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(group)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  ยังไม่มีกลุ่มผู้ขาย
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขกลุ่มผู้ขาย" : "เพิ่มกลุ่มผู้ขาย"}</DialogTitle>
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
                <Label htmlFor="description">คำอธิบาย</Label>
                <Input id="description" name="description" defaultValue={editing?.description || ""} />
              </div>
              <div>
                <Label htmlFor="default_payment_term">เงื่อนไขชำระ</Label>
                <Input
                  id="default_payment_term"
                  name="default_payment_term"
                  defaultValue={editing?.default_payment_term || ""}
                  placeholder="เช่น 30 วัน"
                />
              </div>
              <div>
                <Label>ประเภท WHT</Label>
                <Select value={whtType} onValueChange={setWhtType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกประเภท WHT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่มี</SelectItem>
                    <SelectItem value="service">บริการ (3%)</SelectItem>
                    <SelectItem value="rent">ค่าเช่า (5%)</SelectItem>
                    <SelectItem value="transport">ขนส่ง (1%)</SelectItem>
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
