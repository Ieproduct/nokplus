"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchaseOrder, updatePurchaseOrder, submitPOForApproval } from "@/lib/actions/po";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Send, Save, ArrowLeft, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { calculateNetPayable, getWhtLabel, WhtType } from "@/lib/utils/tax";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface POFormProps {
  po?: {
    id: string;
    title: string;
    description: string | null;
    department: string;
    cost_center: string | null;
    delivery_date: string | null;
    payment_term: string | null;
    wht_type: string | null;
    status: string | null;
    notes: string | null;
    vendor_id: string;
    pr_id: string | null;
    po_line_items?: Array<{
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
    }>;
  };
  vendors: Array<{ id: string; name: string; code: string }>;
  approvedPRs: Array<{ id: string; document_number: string; title: string }>;
  departments: Array<{ code: string; name: string }>;
  costCenters: Array<{ code: string; name: string }>;
  units: Array<{ code: string; name: string }>;
  paymentTerms: Array<{ code: string; name: string }>;
  companies?: Array<{ id: string; name: string }>;
  selectedCompanyId?: string;
}

export function POForm({ po, vendors, approvedPRs, departments, costCenters, units, paymentTerms, companies, selectedCompanyId }: POFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const isEditing = !!po;
  const canEdit = !po || po.status === "draft" || po.status === "revision";
  const showCompanySelector = !isEditing && companies && companies.length > 1;

  const [title, setTitle] = useState(po?.title || "");
  const [description, setDescription] = useState(po?.description || "");
  const [vendorId, setVendorId] = useState(po?.vendor_id || "");
  const [prId, setPrId] = useState(po?.pr_id || "");
  const [department, setDepartment] = useState(po?.department || departments[0]?.code || "");
  const [costCenter, setCostCenter] = useState(po?.cost_center || "");
  const [deliveryDate, setDeliveryDate] = useState(po?.delivery_date || "");
  const [paymentTerm, setPaymentTerm] = useState(po?.payment_term || "NET30");
  const [whtType, setWhtType] = useState<WhtType>((po?.wht_type as WhtType) || "none");
  const [notes, setNotes] = useState(po?.notes || "");
  const [items, setItems] = useState<LineItem[]>(
    po?.po_line_items?.length
      ? po.po_line_items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
        }))
      : [{ description: "", quantity: 1, unit: "PCS", unit_price: 0 }]
  );

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit: "PCS", unit_price: 0 }]);
  const removeItem = (index: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const calc = calculateNetPayable(subtotal, whtType);

  const handleSave = async () => {
    if (!title.trim() || !vendorId) {
      toast.error("กรุณาระบุชื่อเรื่องและเลือกผู้ขาย");
      return;
    }
    setLoading(true);
    try {
      const input = {
        pr_id: prId || undefined,
        vendor_id: vendorId,
        title,
        description: description || undefined,
        department,
        cost_center: costCenter || undefined,
        delivery_date: deliveryDate || undefined,
        payment_term: paymentTerm,
        wht_type: whtType,
        notes: notes || undefined,
        items,
        companyId: selectedCompanyId,
      };

      if (isEditing) {
        await updatePurchaseOrder(po.id, input);
        toast.success("อัพเดท PO สำเร็จ");
      } else {
        const result = await createPurchaseOrder(input);
        toast.success("สร้าง PO สำเร็จ");
        router.push(`/dashboard/po/${result.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (!po) return;
    setLoading(true);
    try {
      await submitPOForApproval(po.id);
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
      {showCompanySelector && (
        <Card className="shadow-sm overflow-hidden border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-center gap-4 py-4">
            <Building2 className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="space-y-1 flex-1">
              <Label className="text-sm font-medium">บริษัท (สร้างเอกสารในนามบริษัท)</Label>
              <Select
                value={selectedCompanyId}
                onValueChange={(v) => router.push(`${pathname}?company=${v}`)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="เลือกบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-linear-to-r from-nok-navy to-nok-blue text-white">
          <CardTitle className="text-white">ข้อมูลใบสั่งซื้อ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 pt-6">
          {approvedPRs.length > 0 && (
            <div className="space-y-2 md:col-span-2">
              <Label>อ้างอิง PR (ถ้ามี)</Label>
              <Select value={prId} onValueChange={setPrId} disabled={!canEdit}>
                <SelectTrigger><SelectValue placeholder="เลือก PR (ไม่บังคับ)" /></SelectTrigger>
                <SelectContent>
                  {approvedPRs.map((pr) => (
                    <SelectItem key={pr.id} value={pr.id}>{pr.document_number} - {pr.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2 md:col-span-2">
            <Label>ชื่อเรื่อง *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อเรื่องใบสั่งซื้อ" disabled={!canEdit} />
          </div>
          <div className="space-y-2">
            <Label>ผู้ขาย *</Label>
            <Select value={vendorId} onValueChange={setVendorId} disabled={!canEdit}>
              <SelectTrigger><SelectValue placeholder="เลือกผู้ขาย" /></SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name} ({v.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>แผนก</Label>
            <Select value={department} onValueChange={setDepartment} disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>เงื่อนไขชำระเงิน</Label>
            <Select value={paymentTerm} onValueChange={setPaymentTerm} disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentTerms.map((pt) => (
                  <SelectItem key={pt.code} value={pt.code}>{pt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ภาษีหัก ณ ที่จ่าย (WHT)</Label>
            <Select value={whtType} onValueChange={(v) => setWhtType(v as WhtType)} disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่หัก WHT</SelectItem>
                <SelectItem value="service">ค่าบริการ (3%)</SelectItem>
                <SelectItem value="rent">ค่าเช่า (5%)</SelectItem>
                <SelectItem value="transport">ค่าขนส่ง (1%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>วันที่ส่งของ</Label>
            <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} disabled={!canEdit} />
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
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-linear-to-r from-nok-navy to-nok-blue text-white">
          <CardTitle className="text-white">รายการสินค้า/บริการ</CardTitle>
          {canEdit && (
            <Button type="button" variant="secondary" size="sm" onClick={addItem} className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-1 h-4 w-4" />เพิ่มรายการ
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
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
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} disabled={!canEdit} placeholder="รายละเอียด" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)} disabled={!canEdit} />
                  </TableCell>
                  <TableCell>
                    <Select value={item.unit} onValueChange={(v) => updateItem(index, "unit", v)} disabled={!canEdit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (<SelectItem key={u.code} value={u.code}>{u.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)} disabled={!canEdit} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                        <Trash2 className="h-4 w-4 text-nok-error" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end p-4 border-t bg-muted/30">
            <div className="w-80 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">รวมก่อน VAT (Subtotal)</span><span className="font-medium">{formatCurrency(calc.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT 7%</span><span className="font-medium">{formatCurrency(calc.vatAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">รวม (Subtotal + VAT)</span><span className="font-medium">{formatCurrency(calc.totalAmount)}</span></div>
              {whtType !== "none" && (
                <div className="flex justify-between text-nok-error">
                  <span>หัก WHT - {getWhtLabel(whtType)}</span>
                  <span>-{formatCurrency(calc.whtAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2 text-nok-navy">
                <span>ยอดสุทธิ (Net Payable)</span>
                <span>{formatCurrency(calc.netAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-nok-navy">หมายเหตุ</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="หมายเหตุ" rows={2} disabled={!canEdit} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/po")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {canEdit ? "ยกเลิก" : "กลับ"}
        </Button>
        <div className="flex-1" />
        {isEditing && (po.status === "draft" || po.status === "revision") && (
          <Button variant="outline" onClick={handleSubmitApproval} disabled={loading} className="border-nok-blue text-nok-blue hover:bg-nok-blue/10">
            <Send className="mr-2 h-4 w-4" />ส่งอนุมัติ
          </Button>
        )}
        {canEdit && (
          <Button onClick={handleSave} disabled={loading} className="bg-nok-blue hover:bg-nok-blue-dark shadow-md">
            <Save className="mr-2 h-4 w-4" />
            {loading ? "กำลังบันทึก..." : isEditing ? "อัพเดท" : "บันทึก"}
          </Button>
        )}
      </div>
    </div>
  );
}
