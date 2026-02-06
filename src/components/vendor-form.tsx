"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVendor, updateVendor } from "@/lib/actions/vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface VendorFormProps {
  vendor?: {
    id: string;
    code: string;
    name: string;
    tax_id: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    contact_person: string | null;
    payment_term: string | null;
    bank_name: string | null;
    bank_account_no: string | null;
    bank_account_name: string | null;
    status: string | null;
    has_pp20: boolean | null;
    has_company_cert: boolean | null;
    has_bank_account_copy: boolean | null;
    has_id_copy: boolean | null;
    has_vat_cert: boolean | null;
    notes: string | null;
  };
  paymentTerms: Array<{ code: string; name: string }>;
}

export function VendorForm({ vendor, paymentTerms }: VendorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!vendor;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (isEditing) {
        await updateVendor(vendor.id, formData);
        toast.success("อัพเดทผู้ขายสำเร็จ");
      } else {
        await createVendor(formData);
        toast.success("เพิ่มผู้ขายสำเร็จ");
      }
      router.push("/dashboard/vendors");
      router.refresh();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลทั่วไป</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">รหัสผู้ขาย *</Label>
            <Input
              id="code"
              name="code"
              defaultValue={vendor?.code || ""}
              required
              disabled={isEditing}
              placeholder="เช่น VD004"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อผู้ขาย *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={vendor?.name || ""}
              required
              placeholder="ชื่อบริษัท/ห้างหุ้นส่วน"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
            <Input
              id="tax_id"
              name="tax_id"
              defaultValue={vendor?.tax_id || ""}
              placeholder="0105XXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_person">ผู้ติดต่อ</Label>
            <Input
              id="contact_person"
              name="contact_person"
              defaultValue={vendor?.contact_person || ""}
              placeholder="ชื่อผู้ติดต่อ"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">โทรศัพท์</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={vendor?.phone || ""}
              placeholder="02-XXX-XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={vendor?.email || ""}
              placeholder="email@company.com"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={vendor?.address || ""}
              placeholder="ที่อยู่เต็ม"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_term">เงื่อนไขชำระเงิน</Label>
            <Select name="payment_term" defaultValue={vendor?.payment_term || "NET30"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentTerms.map((term) => (
                  <SelectItem key={term.code} value={term.code}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select name="status" defaultValue={vendor?.status || "pending"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รอตรวจสอบ</SelectItem>
                  <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="suspended">ระงับชั่วคราว</SelectItem>
                  <SelectItem value="blacklisted">ขึ้นบัญชีดำ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลธนาคาร</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bank_name">ธนาคาร</Label>
            <Input
              id="bank_name"
              name="bank_name"
              defaultValue={vendor?.bank_name || ""}
              placeholder="ชื่อธนาคาร"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_account_no">เลขที่บัญชี</Label>
            <Input
              id="bank_account_no"
              name="bank_account_no"
              defaultValue={vendor?.bank_account_no || ""}
              placeholder="XXX-X-XXXXX-X"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_account_name">ชื่อบัญชี</Label>
            <Input
              id="bank_account_name"
              name="bank_account_name"
              defaultValue={vendor?.bank_account_name || ""}
              placeholder="ชื่อบัญชีธนาคาร"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>เอกสารผู้ขาย</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "has_pp20", label: "ภพ.20 (ใบทะเบียนภาษีมูลค่าเพิ่ม)", checked: vendor?.has_pp20 },
              { name: "has_company_cert", label: "หนังสือรับรองบริษัท", checked: vendor?.has_company_cert },
              { name: "has_bank_account_copy", label: "สำเนาหน้าบัญชีธนาคาร", checked: vendor?.has_bank_account_copy },
              { name: "has_id_copy", label: "สำเนาบัตรประชาชนผู้มีอำนาจ", checked: vendor?.has_id_copy },
              { name: "has_vat_cert", label: "ใบทะเบียนพาณิชย์", checked: vendor?.has_vat_cert },
            ].map((doc) => (
              <label key={doc.name} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                <input
                  type="checkbox"
                  name={doc.name}
                  defaultChecked={doc.checked || false}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{doc.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>หมายเหตุ</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            defaultValue={vendor?.notes || ""}
            placeholder="หมายเหตุเพิ่มเติม"
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "กำลังบันทึก..." : isEditing ? "อัพเดท" : "เพิ่มผู้ขาย"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/vendors")}
        >
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
