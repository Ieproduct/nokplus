"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchaseRequisition, updatePurchaseRequisition, submitPRForApproval } from "@/lib/actions/pr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { calculateVat } from "@/lib/utils/tax";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface PRFormProps {
  pr?: {
    id: string;
    title: string;
    description: string | null;
    department: string;
    cost_center: string | null;
    required_date: string | null;
    status: string | null;
    notes: string | null;
    pr_line_items?: Array<{
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
    }>;
  };
  departments: Array<{ code: string; name: string }>;
  costCenters: Array<{ code: string; name: string }>;
  units: Array<{ code: string; name: string }>;
}

export function PRForm({ pr, departments, costCenters, units }: PRFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!pr;
  const canEdit = !pr || pr.status === "draft" || pr.status === "revision";

  const [title, setTitle] = useState(pr?.title || "");
  const [description, setDescription] = useState(pr?.description || "");
  const [department, setDepartment] = useState(pr?.department || departments[0]?.code || "");
  const [costCenter, setCostCenter] = useState(pr?.cost_center || "");
  const [requiredDate, setRequiredDate] = useState(pr?.required_date || "");
  const [notes, setNotes] = useState(pr?.notes || "");
  const [items, setItems] = useState<LineItem[]>(
    pr?.pr_line_items?.length
      ? pr.pr_line_items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
        }))
      : [{ description: "", quantity: 1, unit: "PCS", unit_price: 0 }]
  );

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit: "PCS", unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const vatAmount = calculateVat(subtotal);
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("กรุณาระบุชื่อเรื่อง");
      return;
    }
    if (items.some((item) => !item.description.trim())) {
      toast.error("กรุณาระบุรายละเอียดสินค้า/บริการทุกรายการ");
      return;
    }

    setLoading(true);
    try {
      const input = {
        title,
        description: description || undefined,
        department,
        cost_center: costCenter || undefined,
        required_date: requiredDate || undefined,
        notes: notes || undefined,
        items,
      };

      if (isEditing) {
        await updatePurchaseRequisition(pr.id, input);
        toast.success("อัพเดท PR สำเร็จ");
      } else {
        const result = await createPurchaseRequisition(input);
        toast.success("สร้าง PR สำเร็จ");
        router.push(`/dashboard/pr/${result.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (!pr) return;
    setLoading(true);
    try {
      await submitPRForApproval(pr.id);
      toast.success("ส่งอนุมัติสำเร็จ");
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลใบขอซื้อ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>ชื่อเรื่อง *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อเรื่องใบขอซื้อ" disabled={!canEdit} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>รายละเอียด</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" rows={2} disabled={!canEdit} />
          </div>
          <div className="space-y-2">
            <Label>แผนก *</Label>
            <Select value={department} onValueChange={setDepartment} disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.code} value={dept.code}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cost Center</Label>
            <Select value={costCenter} onValueChange={setCostCenter} disabled={!canEdit}>
              <SelectTrigger><SelectValue placeholder="เลือก Cost Center" /></SelectTrigger>
              <SelectContent>
                {costCenters.map((cc) => (
                  <SelectItem key={cc.code} value={cc.code}>{cc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>วันที่ต้องการ</Label>
            <Input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} disabled={!canEdit} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>รายการสินค้า/บริการ</CardTitle>
          {canEdit && (
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" />เพิ่มรายการ
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead className="w-24">จำนวน</TableHead>
                <TableHead className="w-28">หน่วย</TableHead>
                <TableHead className="w-32">ราคาต่อหน่วย</TableHead>
                <TableHead className="w-32 text-right">จำนวนเงิน</TableHead>
                {canEdit && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="รายละเอียดสินค้า/บริการ"
                      disabled={!canEdit}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={item.unit} onValueChange={(v) => updateItem(index, "unit", v)} disabled={!canEdit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.code} value={u.code}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span>รวมก่อน VAT</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT 7%</span>
                <span>{formatCurrency(vatAmount)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>รวมทั้งสิ้น</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>หมายเหตุ</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="หมายเหตุเพิ่มเติม" rows={2} disabled={!canEdit} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {canEdit && (
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "กำลังบันทึก..." : isEditing ? "อัพเดท" : "บันทึก"}
          </Button>
        )}
        {isEditing && (pr.status === "draft" || pr.status === "revision") && (
          <Button variant="outline" onClick={handleSubmitApproval} disabled={loading}>
            <Send className="mr-2 h-4 w-4" />ส่งอนุมัติ
          </Button>
        )}
        <Button variant="outline" onClick={() => router.push("/dashboard/pr")}>
          {canEdit ? "ยกเลิก" : "กลับ"}
        </Button>
      </div>
    </div>
  );
}
