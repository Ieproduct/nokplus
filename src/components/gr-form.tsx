"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGoodsReceipt, confirmGoodsReceipt, cancelGoodsReceipt, getPOForGoodsReceipt } from "@/lib/actions/gr";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface GRLineItem {
  po_line_item_id: string;
  description: string;
  unit: string;
  po_qty: number;
  already_received: number;
  max_receivable: number;
  received_qty: number;
  inspection_status: string;
  storage_location: string;
  batch_number: string;
  notes: string;
}

interface FieldControlConfig {
  field_name: string;
  field_label: string;
  is_visible: boolean;
  is_required: boolean;
  is_editable: boolean;
  default_value: string | null;
}

interface GRFormProps {
  gr?: any;
  approvedPOs: { id: string; document_number: string; title: string; vendors?: { name: string } | null }[];
  fieldControls?: FieldControlConfig[];
}

const GR_STATUS_LABELS: Record<string, string> = {
  draft: "ร่าง",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิก",
};

const GR_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function GRForm({ gr, approvedPOs, fieldControls = [] }: GRFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!gr;
  const isReadOnly = isEditing && gr.status !== "draft";

  const [poId, setPoId] = useState(gr?.po_id || "");
  const [receiptDate, setReceiptDate] = useState(
    gr?.receipt_date || new Date().toISOString().split("T")[0]
  );
  const [warehouse, setWarehouse] = useState(gr?.warehouse || "");
  const [notes, setNotes] = useState(gr?.notes || "");
  const [items, setItems] = useState<GRLineItem[]>(() => {
    if (gr?.gr_line_items) {
      return gr.gr_line_items.map((line: any) => ({
        po_line_item_id: line.po_line_item_id,
        description: line.po_line_items?.description || "",
        unit: line.po_line_items?.unit || "",
        po_qty: line.po_line_items?.quantity || 0,
        already_received: (line.po_line_items?.received_qty || 0) - Number(line.received_qty),
        max_receivable: Number(line.received_qty) + (line.po_line_items?.remaining_qty || 0),
        received_qty: Number(line.received_qty),
        inspection_status: line.inspection_status || "pending",
        storage_location: line.storage_location || "",
        batch_number: line.batch_number || "",
        notes: line.notes || "",
      }));
    }
    return [];
  });
  const [poVendorName, setPoVendorName] = useState(
    gr?.purchase_orders?.vendors?.name || ""
  );

  const handlePOSelect = (selectedPoId: string) => {
    setPoId(selectedPoId);
    startTransition(async () => {
      try {
        const po = await getPOForGoodsReceipt(selectedPoId);
        setPoVendorName((po as any).vendors?.name || "");
        const poLines = (po.po_line_items || []).map((line: any) => ({
          po_line_item_id: line.id,
          description: line.description,
          unit: line.unit,
          po_qty: line.quantity,
          already_received: line.received_qty || 0,
          max_receivable: line.remaining_qty ?? line.quantity,
          received_qty: line.remaining_qty ?? line.quantity,
          inspection_status: "pending",
          storage_location: "",
          batch_number: "",
          notes: "",
        }));
        setItems(poLines);
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูล PO ได้");
      }
    });
  };

  const updateItem = (index: number, field: keyof GRLineItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    if (!poId) {
      toast.error("กรุณาเลือกใบสั่งซื้อ");
      return;
    }
    if (items.length === 0) {
      toast.error("ไม่มีรายการสินค้า");
      return;
    }

    // Validate quantities
    for (let i = 0; i < items.length; i++) {
      if (items[i].received_qty < 0) {
        toast.error(`จำนวนรับต้องไม่ติดลบ (รายการ ${i + 1})`);
        return;
      }
      if (items[i].received_qty > items[i].max_receivable) {
        toast.error(`จำนวนรับเกินจำนวนที่สั่ง (รายการ ${i + 1})`);
        return;
      }
    }

    startTransition(async () => {
      try {
        const result = await createGoodsReceipt({
          po_id: poId,
          receipt_date: receiptDate,
          warehouse: warehouse || undefined,
          notes: notes || undefined,
          items: items
            .filter((item) => item.received_qty > 0)
            .map((item) => ({
              po_line_item_id: item.po_line_item_id,
              received_qty: item.received_qty,
              inspection_status: item.inspection_status,
              storage_location: item.storage_location || undefined,
              batch_number: item.batch_number || undefined,
              notes: item.notes || undefined,
            })),
        });
        toast.success("บันทึกใบรับสินค้าสำเร็จ");
        router.push(`/dashboard/gr/${result.id}`);
      } catch (err: any) {
        toast.error(err.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const handleConfirm = async () => {
    if (!gr?.id) return;
    startTransition(async () => {
      try {
        await confirmGoodsReceipt(gr.id);
        toast.success("ยืนยันใบรับสินค้าสำเร็จ");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const handleCancel = async () => {
    if (!gr?.id) return;
    startTransition(async () => {
      try {
        await cancelGoodsReceipt(gr.id);
        toast.success("ยกเลิกใบรับสินค้าสำเร็จ");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const totalReceived = items.reduce((sum, item) => sum + item.received_qty, 0);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลใบรับสินค้า</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>ใบสั่งซื้อ (PO) *</Label>
            {isEditing ? (
              <Input value={gr.purchase_orders?.document_number || poId} disabled />
            ) : (
              <Select value={poId} onValueChange={handlePOSelect} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกใบสั่งซื้อ" />
                </SelectTrigger>
                <SelectContent>
                  {approvedPOs.map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.document_number} - {po.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {poVendorName && (
            <div>
              <Label>ผู้ขาย</Label>
              <Input value={poVendorName} disabled />
            </div>
          )}

          <div>
            <Label>วันที่รับ *</Label>
            <Input
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label>คลังสินค้า</Label>
            <Input
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              placeholder="ระบุคลังสินค้า"
              disabled={isReadOnly}
            />
          </div>

          <div className="md:col-span-2">
            <Label>หมายเหตุ</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="หมายเหตุเพิ่มเติม"
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>รายการสินค้า ({items.length} รายการ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead className="text-center">หน่วย</TableHead>
                    <TableHead className="text-right">สั่งซื้อ</TableHead>
                    <TableHead className="text-right">รับแล้ว</TableHead>
                    <TableHead className="text-right">คงเหลือ</TableHead>
                    <TableHead className="text-right w-32">รับครั้งนี้</TableHead>
                    <TableHead className="w-36">สถานะตรวจ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-center">{item.unit}</TableCell>
                      <TableCell className="text-right">{item.po_qty}</TableCell>
                      <TableCell className="text-right">{item.already_received}</TableCell>
                      <TableCell className="text-right">{item.max_receivable}</TableCell>
                      <TableCell className="text-right">
                        {isReadOnly ? (
                          <span className="font-medium">{item.received_qty}</span>
                        ) : (
                          <Input
                            type="number"
                            min={0}
                            max={item.max_receivable}
                            step="0.01"
                            value={item.received_qty}
                            onChange={(e) =>
                              updateItem(index, "received_qty", Number(e.target.value))
                            }
                            className="w-24 text-right"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {isReadOnly ? (
                          <Badge className={
                            item.inspection_status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : item.inspection_status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }>
                            {item.inspection_status === "accepted" ? "ผ่าน" :
                             item.inspection_status === "rejected" ? "ไม่ผ่าน" :
                             item.inspection_status === "partial" ? "ผ่านบางส่วน" : "รอตรวจ"}
                          </Badge>
                        ) : (
                          <Select
                            value={item.inspection_status}
                            onValueChange={(v) => updateItem(index, "inspection_status", v)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">รอตรวจ</SelectItem>
                              <SelectItem value="accepted">ผ่าน</SelectItem>
                              <SelectItem value="rejected">ไม่ผ่าน</SelectItem>
                              <SelectItem value="partial">ผ่านบางส่วน</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="text-sm text-muted-foreground">
                รวมรับครั้งนี้: <span className="font-semibold text-foreground">{totalReceived}</span> รายการ
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/gr")}
        >
          {isReadOnly ? "กลับ" : "ยกเลิก"}
        </Button>

        {isEditing && gr.status === "draft" && (
          <>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
            >
              ยกเลิกใบรับสินค้า
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "กำลังยืนยัน..." : "ยืนยันใบรับสินค้า"}
            </Button>
          </>
        )}

        {isEditing && gr.status === "confirmed" && (
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            ยกเลิกใบรับสินค้า (คืนจำนวน)
          </Button>
        )}

        {!isEditing && (
          <Button
            className="bg-nok-blue hover:bg-nok-blue-dark"
            onClick={handleSave}
            disabled={isPending || items.length === 0}
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกใบรับสินค้า"}
          </Button>
        )}
      </div>
    </div>
  );
}
