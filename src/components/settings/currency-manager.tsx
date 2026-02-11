"use client";

import { useState } from "react";
import { createCurrency, updateCurrency, deleteCurrency } from "@/lib/actions/finance";
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

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
  exchange_rate: number;
  is_base: boolean;
}

export function CurrencyManager({ currencies }: { currencies: Currency[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        code: (form.get("code") as string).toUpperCase(),
        name: form.get("name") as string,
        symbol: form.get("symbol") as string,
        exchange_rate: parseFloat(form.get("exchange_rate") as string),
      };

      if (editing) {
        await updateCurrency(editing.id, data);
        toast.success("แก้ไขสกุลเงินเรียบร้อย");
      } else {
        await createCurrency(data);
        toast.success("เพิ่มสกุลเงินเรียบร้อย");
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(currency: Currency) {
    if (currency.is_base) {
      toast.error("ไม่สามารถลบสกุลเงินหลักได้");
      return;
    }
    if (!confirm("ต้องการลบสกุลเงินนี้?")) return;
    try {
      await deleteCurrency(currency.id);
      toast.success("ลบสกุลเงินเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">สกุลเงินทั้งหมด ({currencies.length})</h3>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มสกุลเงิน
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>สัญลักษณ์</TableHead>
              <TableHead className="text-right">อัตราแลกเปลี่ยน</TableHead>
              <TableHead>สกุลเงินหลัก</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.symbol || "-"}</TableCell>
                <TableCell className="text-right font-mono">
                  {c.exchange_rate.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  {c.is_base && <Badge>สกุลเงินหลัก</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c)}
                      disabled={c.is_base}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currencies.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  ยังไม่มีสกุลเงิน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขสกุลเงิน" : "เพิ่มสกุลเงิน"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">รหัส ISO *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="เช่น THB, USD"
                  defaultValue={editing?.code || ""}
                  required
                  maxLength={3}
                  disabled={!!editing}
                />
              </div>
              <div>
                <Label htmlFor="name">ชื่อ *</Label>
                <Input id="name" name="name" placeholder="เช่น บาท" defaultValue={editing?.name || ""} required />
              </div>
              <div>
                <Label htmlFor="symbol">สัญลักษณ์</Label>
                <Input id="symbol" name="symbol" placeholder="เช่น ฿, $" defaultValue={editing?.symbol || ""} />
              </div>
              <div>
                <Label htmlFor="exchange_rate">อัตราแลกเปลี่ยน *</Label>
                <Input
                  id="exchange_rate"
                  name="exchange_rate"
                  type="number"
                  step="0.0001"
                  min="0"
                  defaultValue={editing?.exchange_rate ?? 1}
                  required
                />
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
