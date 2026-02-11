"use client";

import { useState } from "react";
import {
  createVendorDocRequirement,
  updateVendorDocRequirement,
  deleteVendorDocRequirement,
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

interface VendorDoc {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_required: boolean;
}

export function VendorDocManager({ documents }: { documents: VendorDoc[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VendorDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRequired, setIsRequired] = useState(false);

  function openCreate() {
    setEditing(null);
    setIsRequired(false);
    setOpen(true);
  }

  function openEdit(doc: VendorDoc) {
    setEditing(doc);
    setIsRequired(doc.is_required);
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
        is_required: isRequired,
      };

      if (editing) {
        await updateVendorDocRequirement(editing.id, data);
        toast.success("แก้ไขเอกสารเรียบร้อย");
      } else {
        await createVendorDocRequirement(data);
        toast.success("เพิ่มเอกสารเรียบร้อย");
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
    if (!confirm("ต้องการลบเอกสารนี้?")) return;
    try {
      await deleteVendorDocRequirement(id);
      toast.success("ลบเอกสารเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">เอกสารผู้ขายทั้งหมด ({documents.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มเอกสาร
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อเอกสาร</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead>จำเป็น</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-mono">{doc.code}</TableCell>
                <TableCell>{doc.name}</TableCell>
                <TableCell className="text-muted-foreground">{doc.description || "-"}</TableCell>
                <TableCell>
                  <Badge variant={doc.is_required ? "default" : "secondary"}>
                    {doc.is_required ? "จำเป็น" : "ไม่จำเป็น"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีเอกสาร
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขเอกสาร" : "เพิ่มเอกสาร"}</DialogTitle>
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
