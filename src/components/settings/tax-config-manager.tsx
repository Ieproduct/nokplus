"use client";

import { useState } from "react";
import {
  createTaxConfiguration,
  updateTaxConfiguration,
  deleteTaxConfiguration,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TaxConfig {
  id: string;
  tax_type: string;
  code: string;
  label: string;
  rate: number;
  description: string | null;
  calculation_base: string | null;
}

export function TaxConfigManager({ configs }: { configs: TaxConfig[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaxConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [taxType, setTaxType] = useState<string>("vat");
  const [calcBase, setCalcBase] = useState<string>("subtotal");

  const vatConfigs = configs.filter((c) => c.tax_type === "vat");
  const whtConfigs = configs.filter((c) => c.tax_type === "wht");

  function openCreate() {
    setEditing(null);
    setTaxType("vat");
    setCalcBase("subtotal");
    setOpen(true);
  }

  function openEdit(config: TaxConfig) {
    setEditing(config);
    setTaxType(config.tax_type);
    setCalcBase(config.calculation_base || "subtotal");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);

      if (editing) {
        const data = {
          label: form.get("label") as string,
          rate: parseFloat(form.get("rate") as string),
          description: (form.get("description") as string) || undefined,
        };
        await updateTaxConfiguration(editing.id, data);
        toast.success("แก้ไขการตั้งค่าภาษีเรียบร้อย");
      } else {
        const data = {
          tax_type: taxType,
          code: form.get("code") as string,
          label: form.get("label") as string,
          rate: parseFloat(form.get("rate") as string),
          description: (form.get("description") as string) || undefined,
          calculation_base: calcBase,
        };
        await createTaxConfiguration(data);
        toast.success("เพิ่มการตั้งค่าภาษีเรียบร้อย");
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
    if (!confirm("ต้องการลบการตั้งค่าภาษีนี้?")) return;
    try {
      await deleteTaxConfiguration(id);
      toast.success("ลบการตั้งค่าภาษีเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  function renderTaxTable(items: TaxConfig[], title: string) {
    return (
      <>
        <h4 className="font-medium text-sm text-muted-foreground mt-4 mb-2">{title}</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead className="text-right">อัตรา (%)</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.label}</TableCell>
                <TableCell className="text-right font-mono">{c.rate}%</TableCell>
                <TableCell className="text-muted-foreground">{c.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                  ยังไม่มีรายการ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">การตั้งค่าภาษีทั้งหมด ({configs.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มรายการภาษี
          </Button>
        </div>

        {renderTaxTable(vatConfigs, "ภาษีมูลค่าเพิ่ม (VAT)")}
        {renderTaxTable(whtConfigs, "ภาษีหัก ณ ที่จ่าย (WHT)")}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "แก้ไขการตั้งค่าภาษี" : "เพิ่มรายการภาษี"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div>
                  <Label>ประเภทภาษี *</Label>
                  <Select value={taxType} onValueChange={setTaxType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vat">VAT - ภาษีมูลค่าเพิ่ม</SelectItem>
                      <SelectItem value="wht">WHT - ภาษีหัก ณ ที่จ่าย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="code">รหัส *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="เช่น VAT7, WHT3"
                  defaultValue={editing?.code || ""}
                  required
                  disabled={!!editing}
                />
              </div>
              <div>
                <Label htmlFor="label">ชื่อ *</Label>
                <Input
                  id="label"
                  name="label"
                  placeholder="เช่น ภาษีมูลค่าเพิ่ม 7%"
                  defaultValue={editing?.label || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rate">อัตรา (%) *</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={editing?.rate ?? ""}
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
              {!editing && (
                <div>
                  <Label>ฐานคำนวณ</Label>
                  <Select value={calcBase} onValueChange={setCalcBase}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtotal">ยอดก่อน VAT (Subtotal)</SelectItem>
                      <SelectItem value="before_vat">ก่อนภาษีมูลค่าเพิ่ม</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
