"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApVoucher, updateApVoucher, updateApChecklist, updatePaymentStatus, submitAPForApproval } from "@/lib/actions/ap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Send, CreditCard, Save, ArrowLeft, ClipboardCheck, Building2 } from "lucide-react";
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

interface APFormProps {
  ap?: {
    id: string;
    title: string;
    description: string | null;
    department: string;
    cost_center: string | null;
    due_date: string | null;
    invoice_number: string | null;
    invoice_date: string | null;
    wht_type: string | null;
    status: string | null;
    payment_status: string | null;
    notes: string | null;
    vendor_id: string;
    po_id: string | null;
    check_invoice_original: boolean | null;
    check_po_copy: boolean | null;
    check_delivery_note: boolean | null;
    check_inspection_report: boolean | null;
    check_tax_invoice: boolean | null;
    check_wht_cert: boolean | null;
    check_receipt: boolean | null;
    check_approval_doc: boolean | null;
    net_amount: number | null;
    ap_line_items?: Array<{
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
    }>;
  };
  vendors: Array<{ id: string; name: string; code: string }>;
  approvedPOs: Array<{ id: string; document_number: string; title: string }>;
  departments: Array<{ code: string; name: string }>;
  costCenters: Array<{ code: string; name: string }>;
  units: Array<{ code: string; label: string }>;
  companies?: Array<{ id: string; name: string }>;
  selectedCompanyId?: string;
  fieldControls?: Array<{
    field_name: string;
    field_label: string;
    is_visible: boolean;
    is_required: boolean;
    is_editable: boolean;
    default_value: string | null;
  }>;
}

const AP_CHECKLIST_ITEMS = [
  { key: "check_invoice_original", label: "ใบแจ้งหนี้/ใบกำกับภาษีตัวจริง", required: true },
  { key: "check_po_copy", label: "สำเนาใบสั่งซื้อ (PO)", required: true },
  { key: "check_delivery_note", label: "ใบส่งของ/ใบรับของ", required: true },
  { key: "check_inspection_report", label: "ใบตรวจรับ", required: true },
  { key: "check_tax_invoice", label: "ใบกำกับภาษี", required: true },
  { key: "check_wht_cert", label: "หนังสือรับรองการหักภาษี ณ ที่จ่าย", required: false },
  { key: "check_receipt", label: "ใบเสร็จรับเงิน", required: false },
  { key: "check_approval_doc", label: "เอกสารอนุมัติ", required: true },
];

export function APForm({ ap, vendors, approvedPOs, departments, costCenters, units, companies, selectedCompanyId, fieldControls = [] }: APFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const isEditing = !!ap;
  const canEdit = !ap || ap.status === "draft" || ap.status === "revision";
  const showCompanySelector = !isEditing && companies && companies.length > 1;

  const [title, setTitle] = useState(ap?.title || "");
  const [description, setDescription] = useState(ap?.description || "");
  const [vendorId, setVendorId] = useState(ap?.vendor_id || "");
  const [poId, setPoId] = useState(ap?.po_id || "");
  const [department, setDepartment] = useState(ap?.department || departments[0]?.code || "");
  const [costCenter, setCostCenter] = useState(ap?.cost_center || "");
  const [dueDate, setDueDate] = useState(ap?.due_date || "");
  const [invoiceNumber, setInvoiceNumber] = useState(ap?.invoice_number || "");
  const [invoiceDate, setInvoiceDate] = useState(ap?.invoice_date || "");
  const [whtType, setWhtType] = useState<WhtType>((ap?.wht_type as WhtType) || "none");
  const [notes, setNotes] = useState(ap?.notes || "");
  const [items, setItems] = useState<LineItem[]>(
    ap?.ap_line_items?.length
      ? ap.ap_line_items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
        }))
      : [{ description: "", quantity: 1, unit: "PCS", unit_price: 0 }]
  );

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    check_invoice_original: ap?.check_invoice_original || false,
    check_po_copy: ap?.check_po_copy || false,
    check_delivery_note: ap?.check_delivery_note || false,
    check_inspection_report: ap?.check_inspection_report || false,
    check_tax_invoice: ap?.check_tax_invoice || false,
    check_wht_cert: ap?.check_wht_cert || false,
    check_receipt: ap?.check_receipt || false,
    check_approval_doc: ap?.check_approval_doc || false,
  });

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit: "PCS", unit_price: 0 }]);
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const calc = calculateNetPayable(subtotal, whtType);

  const requiredChecked = AP_CHECKLIST_ITEMS
    .filter((item) => item.required)
    .every((item) => checklist[item.key]);

  const handleSave = async () => {
    if (!title.trim() || !vendorId) {
      toast.error("กรุณาระบุชื่อเรื่องและเลือกผู้ขาย");
      return;
    }
    setLoading(true);
    try {
      const input = {
        po_id: poId || undefined,
        vendor_id: vendorId,
        title,
        description: description || undefined,
        department,
        cost_center: costCenter || undefined,
        due_date: dueDate || undefined,
        invoice_number: invoiceNumber || undefined,
        invoice_date: invoiceDate || undefined,
        wht_type: whtType,
        notes: notes || undefined,
        items,
        companyId: selectedCompanyId,
      };

      if (isEditing) {
        await updateApVoucher(ap.id, input);
        toast.success("อัพเดท AP สำเร็จ");
      } else {
        const result = await createApVoucher(input);
        toast.success("สร้าง AP สำเร็จ");
        router.push(`/dashboard/ap/${result.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = async (key: string, checked: boolean) => {
    const newChecklist = { ...checklist, [key]: checked };
    setChecklist(newChecklist);
    if (ap) {
      try {
        await updateApChecklist(ap.id, { [key]: checked });
      } catch {
        toast.error("ไม่สามารถอัพเดท checklist");
      }
    }
  };

  const handleSubmitApproval = async () => {
    if (!ap) return;
    if (!requiredChecked) {
      toast.error("กรุณาตรวจสอบเอกสารที่จำเป็นให้ครบถ้วน");
      return;
    }
    setLoading(true);
    try {
      await submitAPForApproval(ap.id);
      toast.success("ส่งอนุมัติสำเร็จ");
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!ap) return;
    setLoading(true);
    try {
      await updatePaymentStatus(ap.id, "paid", ap.net_amount || 0);
      toast.success("บันทึกการจ่ายเงินสำเร็จ");
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
          <CardTitle className="text-white">ข้อมูลใบสำคัญจ่าย</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 pt-6">
          {approvedPOs.length > 0 && (
            <div className="space-y-2 md:col-span-2">
              <Label>อ้างอิง PO (ถ้ามี)</Label>
              <Select value={poId} onValueChange={setPoId} disabled={!canEdit}>
                <SelectTrigger><SelectValue placeholder="เลือก PO (ไม่บังคับ)" /></SelectTrigger>
                <SelectContent>
                  {approvedPOs.map((po) => (
                    <SelectItem key={po.id} value={po.id}>{po.document_number} - {po.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2 md:col-span-2">
            <Label>ชื่อเรื่อง *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อเรื่อง" disabled={!canEdit} />
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
            <Label>เลขที่ใบแจ้งหนี้</Label>
            <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-XXXX" disabled={!canEdit} />
          </div>
          <div className="space-y-2">
            <Label>วันที่ใบแจ้งหนี้</Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} disabled={!canEdit} />
          </div>
          <div className="space-y-2">
            <Label>วันครบกำหนดชำระ</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={!canEdit} />
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
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-linear-to-r from-nok-navy to-nok-blue text-white">
          <CardTitle className="text-white">รายการ</CardTitle>
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
                        {units.map((u) => (<SelectItem key={u.code} value={u.code}>{u.label}</SelectItem>))}
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
              <div className="flex justify-between"><span className="text-muted-foreground">รวมก่อน VAT</span><span className="font-medium">{formatCurrency(calc.subtotal)}</span></div>
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

      {/* AP Checklist */}
      {isEditing && (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-nok-navy">AP Checklist - ตรวจสอบเอกสาร</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              {AP_CHECKLIST_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all duration-200 ${
                    checklist[item.key]
                      ? "bg-green-50 border-green-300"
                      : "hover:bg-muted border-transparent bg-muted/30"
                  }`}
                >
                  <Checkbox
                    checked={checklist[item.key]}
                    onCheckedChange={(checked) => handleChecklistChange(item.key, !!checked)}
                  />
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.required && <span className="text-xs text-nok-error ml-1">*</span>}
                  </div>
                </label>
              ))}
            </div>
            {!requiredChecked && (
              <p className="mt-3 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                กรุณาตรวจสอบเอกสารที่มีเครื่องหมาย * ให้ครบถ้วนก่อนส่งอนุมัติ
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-nok-navy">หมายเหตุ</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="หมายเหตุ" rows={2} disabled={!canEdit} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/ap")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {canEdit ? "ยกเลิก" : "กลับ"}
        </Button>
        <div className="flex-1" />
        {isEditing && ap.status === "approved" && ap.payment_status !== "paid" && (
          <Button onClick={handleMarkPaid} disabled={loading} className="bg-nok-success hover:bg-green-700 shadow-md">
            <CreditCard className="mr-2 h-4 w-4" />บันทึกจ่ายเงิน
          </Button>
        )}
        {isEditing && (ap.status === "draft" || ap.status === "revision") && (
          <Button variant="outline" onClick={handleSubmitApproval} disabled={loading || !requiredChecked} className="border-nok-blue text-nok-blue hover:bg-nok-blue/10">
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
