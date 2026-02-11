"use client";

import { useState } from "react";
import {
  createMatchingRule,
  updateMatchingRule,
  deleteMatchingRule,
} from "@/lib/actions/document-config";
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

interface MatchingRule {
  id: string;
  name: string;
  description: string | null;
  match_po: boolean;
  match_gr: boolean;
  match_invoice: boolean;
  price_tolerance_percent: number | null;
  quantity_tolerance_percent: number | null;
}

export function MatchingRuleManager({ rules }: { rules: MatchingRule[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MatchingRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchPo, setMatchPo] = useState(false);
  const [matchGr, setMatchGr] = useState(false);
  const [matchInvoice, setMatchInvoice] = useState(false);

  function openCreate() {
    setEditing(null);
    setMatchPo(false);
    setMatchGr(false);
    setMatchInvoice(false);
    setOpen(true);
  }

  function openEdit(rule: MatchingRule) {
    setEditing(rule);
    setMatchPo(rule.match_po);
    setMatchGr(rule.match_gr);
    setMatchInvoice(rule.match_invoice);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        name: form.get("name") as string,
        description: (form.get("description") as string) || undefined,
        match_po: matchPo,
        match_gr: matchGr,
        match_invoice: matchInvoice,
        price_tolerance_percent: parseFloat(form.get("price_tolerance_percent") as string) || 0,
        quantity_tolerance_percent: parseFloat(form.get("quantity_tolerance_percent") as string) || 0,
      };

      if (editing) {
        await updateMatchingRule(editing.id, data);
        toast.success("แก้ไขกฎการจับคู่เรียบร้อย");
      } else {
        await createMatchingRule(data);
        toast.success("เพิ่มกฎการจับคู่เรียบร้อย");
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
    if (!confirm("ต้องการลบกฎการจับคู่นี้?")) return;
    try {
      await deleteMatchingRule(id);
      toast.success("ลบกฎการจับคู่เรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">กฎการจับคู่ทั้งหมด ({rules.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มกฎ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead className="text-center">PO</TableHead>
              <TableHead className="text-center">ใบรับของ</TableHead>
              <TableHead className="text-center">ใบแจ้งหนี้</TableHead>
              <TableHead className="text-right">% ราคา</TableHead>
              <TableHead className="text-right">% จำนวน</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    {rule.description && (
                      <div className="text-sm text-muted-foreground">{rule.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={rule.match_po ? "default" : "secondary"}>
                    {rule.match_po ? "ใช่" : "ไม่"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={rule.match_gr ? "default" : "secondary"}>
                    {rule.match_gr ? "ใช่" : "ไม่"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={rule.match_invoice ? "default" : "secondary"}>
                    {rule.match_invoice ? "ใช่" : "ไม่"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{rule.price_tolerance_percent ?? 0}%</TableCell>
                <TableCell className="text-right font-mono">{rule.quantity_tolerance_percent ?? 0}%</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(rule)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  ยังไม่มีกฎการจับคู่
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขกฎการจับคู่" : "เพิ่มกฎการจับคู่"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">ชื่อ *</Label>
                <Input id="name" name="name" defaultValue={editing?.name || ""} required />
              </div>
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Input id="description" name="description" defaultValue={editing?.description || ""} />
              </div>
              <div className="space-y-2">
                <Label>เอกสารที่จับคู่</Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="match_po"
                      checked={matchPo}
                      onCheckedChange={(v) => setMatchPo(v === true)}
                    />
                    <Label htmlFor="match_po" className="cursor-pointer">PO</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="match_gr"
                      checked={matchGr}
                      onCheckedChange={(v) => setMatchGr(v === true)}
                    />
                    <Label htmlFor="match_gr" className="cursor-pointer">ใบรับของ</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="match_invoice"
                      checked={matchInvoice}
                      onCheckedChange={(v) => setMatchInvoice(v === true)}
                    />
                    <Label htmlFor="match_invoice" className="cursor-pointer">ใบแจ้งหนี้</Label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_tolerance_percent">% ราคาที่ยอมรับ</Label>
                  <Input
                    id="price_tolerance_percent"
                    name="price_tolerance_percent"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editing?.price_tolerance_percent ?? 0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity_tolerance_percent">% จำนวนที่ยอมรับ</Label>
                  <Input
                    id="quantity_tolerance_percent"
                    name="quantity_tolerance_percent"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editing?.quantity_tolerance_percent ?? 0}
                    required
                  />
                </div>
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
