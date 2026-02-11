"use client";

import { useState } from "react";
import { updateDocumentNumberRange } from "@/lib/actions/document-config";
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
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface DocumentNumberRange {
  id: string;
  document_type: string;
  prefix: string;
  format: string;
  next_number: number;
  description: string | null;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  pr: "ใบขอซื้อ (PR)",
  po: "ใบสั่งซื้อ (PO)",
  ap: "ใบแจ้งหนี้ (AP)",
};

export function DocumentNumberManager({ ranges }: { ranges: DocumentNumberRange[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentNumberRange | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        prefix: form.get("prefix") as string,
        format: form.get("format") as string,
        next_number: parseInt(form.get("next_number") as string, 10),
        description: form.get("description") as string,
      };

      await updateDocumentNumberRange(editing!.id, data);
      toast.success("แก้ไขรูปแบบเลขเอกสารเรียบร้อย");
      setOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(range: DocumentNumberRange) {
    setEditing(range);
    setOpen(true);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">รูปแบบเลขเอกสาร ({ranges.length})</h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ประเภท</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>รูปแบบ</TableHead>
              <TableHead>เลขถัดไป</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranges.map((range) => (
              <TableRow key={range.id}>
                <TableCell className="font-medium">
                  {DOC_TYPE_LABELS[range.document_type] || range.document_type.toUpperCase()}
                </TableCell>
                <TableCell className="font-mono">{range.prefix}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{range.format}</TableCell>
                <TableCell className="font-mono">{range.next_number}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(range)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {ranges.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ยังไม่มีข้อมูลรูปแบบเลขเอกสาร
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                แก้ไขรูปแบบเลขเอกสาร - {editing ? (DOC_TYPE_LABELS[editing.document_type] || editing.document_type.toUpperCase()) : ""}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="prefix">Prefix *</Label>
                <Input id="prefix" name="prefix" defaultValue={editing?.prefix || ""} required />
              </div>
              <div>
                <Label htmlFor="format">รูปแบบ *</Label>
                <Input id="format" name="format" defaultValue={editing?.format || ""} required />
              </div>
              <div>
                <Label htmlFor="next_number">เลขถัดไป *</Label>
                <Input
                  id="next_number"
                  name="next_number"
                  type="number"
                  min={1}
                  defaultValue={editing?.next_number || 1}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Input id="description" name="description" defaultValue={editing?.description || ""} />
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
