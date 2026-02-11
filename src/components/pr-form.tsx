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
import { Plus, Trash2, Send, Save, ArrowLeft, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { calculateVat, calculateVatFromConfig } from "@/lib/utils/tax";
import { useFieldControls, type FieldControlConfig } from "@/lib/hooks/use-field-controls";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  material_code?: string;
  delivery_date?: string;
}

interface TaxConfig {
  code: string;
  label: string;
  tax_type: string;
  rate: number;
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
    priority?: string | null;
    purchasing_org_id?: string | null;
    currency_code?: string | null;
    pr_line_items?: Array<{
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
      material_code?: string | null;
      delivery_date?: string | null;
    }>;
  };
  departments: Array<{ code: string; name: string }>;
  costCenters: Array<{ code: string; name: string }>;
  units: Array<{ code: string; name: string }>;
  companies?: Array<{ id: string; name: string }>;
  selectedCompanyId?: string;
  purchasingOrgs?: Array<{ id: string; code: string; name: string }>;
  currencies?: Array<{ code: string; name: string; exchange_rate?: number }>;
  taxConfigs?: TaxConfig[];
  fieldControls?: FieldControlConfig[];
}

export function PRForm({ pr, departments, costCenters, units, companies, selectedCompanyId, purchasingOrgs, currencies, taxConfigs, fieldControls = [] }: PRFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const fc = useFieldControls(fieldControls);
  const [loading, setLoading] = useState(false);
  const isEditing = !!pr;
  const canEdit = !pr || pr.status === "draft" || pr.status === "revision";
  const showCompanySelector = !isEditing && companies && companies.length > 1;

  const [title, setTitle] = useState(pr?.title || "");
  const [description, setDescription] = useState(pr?.description || "");
  const [department, setDepartment] = useState(pr?.department || departments[0]?.code || "");
  const [costCenter, setCostCenter] = useState(pr?.cost_center || "");
  const [requiredDate, setRequiredDate] = useState(pr?.required_date || "");
  const [notes, setNotes] = useState(pr?.notes || "");
  const [priority, setPriority] = useState(pr?.priority || "normal");
  const [purchasingOrgId, setPurchasingOrgId] = useState(pr?.purchasing_org_id || "");
  const [currencyCode, setCurrencyCode] = useState(pr?.currency_code || "THB");
  const [items, setItems] = useState<LineItem[]>(
    pr?.pr_line_items?.length
      ? pr.pr_line_items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          material_code: item.material_code || "",
          delivery_date: item.delivery_date || "",
        }))
      : [{ description: "", quantity: 1, unit: "PCS", unit_price: 0, material_code: "", delivery_date: "" }]
  );

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit: "PCS", unit_price: 0, material_code: "", delivery_date: "" }]);
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
  const vatConfig = taxConfigs?.find((t) => t.tax_type === "vat");
  const vatRate = vatConfig ? vatConfig.rate / 100 : 0.07;
  const vatAmount = taxConfigs ? calculateVatFromConfig(subtotal, vatRate) : calculateVat(subtotal);
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
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          material_code: item.material_code || undefined,
          delivery_date: item.delivery_date || undefined,
        })),
        companyId: selectedCompanyId,
        priority,
        purchasing_org_id: purchasingOrgId || undefined,
        currency_code: currencyCode,
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
          <CardTitle className="text-white">ข้อมูลใบขอซื้อ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 pt-6">
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
          <div className="space-y-2">
            <Label>ความสำคัญ</Label>
            <Select value={priority} onValueChange={setPriority} disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">ต่ำ</SelectItem>
                <SelectItem value="normal">ปกติ</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="urgent">เร่งด่วน</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {purchasingOrgs && purchasingOrgs.length > 0 && (
            <div className="space-y-2">
              <Label>หน่วยจัดซื้อ</Label>
              <Select value={purchasingOrgId} onValueChange={setPurchasingOrgId} disabled={!canEdit}>
                <SelectTrigger><SelectValue placeholder="เลือกหน่วยจัดซื้อ" /></SelectTrigger>
                <SelectContent>
                  {purchasingOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name} ({org.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {currencies && currencies.length > 0 && (
            <div className="space-y-2">
              <Label>สกุลเงิน</Label>
              <Select value={currencyCode} onValueChange={setCurrencyCode} disabled={!canEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((cur) => (
                    <SelectItem key={cur.code} value={cur.code}>{cur.name} ({cur.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-28">รหัสสินค้า</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead className="w-24">จำนวน</TableHead>
                  <TableHead className="w-28">หน่วย</TableHead>
                  <TableHead className="w-32">ราคาต่อหน่วย</TableHead>
                  <TableHead className="w-32 text-right">จำนวนเงิน</TableHead>
                  <TableHead className="w-32">วันที่ต้องการ</TableHead>
                  {canEdit && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <Input
                        value={item.material_code || ""}
                        onChange={(e) => updateItem(index, "material_code", e.target.value)}
                        placeholder="รหัส"
                        disabled={!canEdit}
                      />
                    </TableCell>
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
                    <TableCell>
                      <Input
                        type="date"
                        value={item.delivery_date || ""}
                        onChange={(e) => updateItem(index, "delivery_date", e.target.value)}
                        disabled={!canEdit}
                      />
                    </TableCell>
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
          </div>

          <div className="flex justify-end p-4 border-t bg-muted/30">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">รวมก่อน VAT</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT {(vatRate * 100).toFixed(0)}%</span>
                <span className="font-medium">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2 text-nok-navy">
                <span>รวมทั้งสิ้น</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-nok-navy">หมายเหตุ</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="หมายเหตุเพิ่มเติม" rows={2} disabled={!canEdit} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard/pr")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {canEdit ? "ยกเลิก" : "กลับ"}
        </Button>
        <div className="flex-1" />
        {isEditing && (pr.status === "draft" || pr.status === "revision") && (
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
