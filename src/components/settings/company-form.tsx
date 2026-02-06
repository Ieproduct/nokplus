"use client";

import { useState } from "react";
import { updateCompany } from "@/lib/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface CompanyFormProps {
  company: {
    name_th: string;
    name_en: string | null;
    tax_id: string | null;
    address_th: string | null;
    address_en: string | null;
    phone: string | null;
    fax: string | null;
    email: string | null;
    website: string | null;
    procurement_contact_name: string | null;
    procurement_contact_position: string | null;
    procurement_contact_phone: string | null;
    procurement_contact_email: string | null;
  };
}

export function CompanyForm({ company }: CompanyFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      await updateCompany({
        name_th: form.get("name_th") as string,
        name_en: form.get("name_en") as string,
        tax_id: form.get("tax_id") as string,
        address_th: form.get("address_th") as string,
        address_en: form.get("address_en") as string,
        phone: form.get("phone") as string,
        fax: form.get("fax") as string,
        email: form.get("email") as string,
        website: form.get("website") as string,
        procurement_contact_name: form.get("procurement_contact_name") as string,
        procurement_contact_position: form.get("procurement_contact_position") as string,
        procurement_contact_phone: form.get("procurement_contact_phone") as string,
        procurement_contact_email: form.get("procurement_contact_email") as string,
      });
      toast.success("บันทึกข้อมูลบริษัทเรียบร้อย");
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : "ไม่ทราบ"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name_th">ชื่อบริษัท (TH) *</Label>
              <Input id="name_th" name="name_th" defaultValue={company.name_th} required />
            </div>
            <div>
              <Label htmlFor="name_en">ชื่อบริษัท (EN)</Label>
              <Input id="name_en" name="name_en" defaultValue={company.name_en || ""} />
            </div>
            <div>
              <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
              <Input id="tax_id" name="tax_id" defaultValue={company.tax_id || ""} />
            </div>
            <div>
              <Label htmlFor="phone">โทรศัพท์</Label>
              <Input id="phone" name="phone" defaultValue={company.phone || ""} />
            </div>
            <div>
              <Label htmlFor="fax">แฟกซ์</Label>
              <Input id="fax" name="fax" defaultValue={company.fax || ""} />
            </div>
            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" name="email" type="email" defaultValue={company.email || ""} />
            </div>
            <div>
              <Label htmlFor="website">เว็บไซต์</Label>
              <Input id="website" name="website" defaultValue={company.website || ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="address_th">ที่อยู่ (TH)</Label>
            <Textarea id="address_th" name="address_th" defaultValue={company.address_th || ""} rows={2} />
          </div>
          <div>
            <Label htmlFor="address_en">ที่อยู่ (EN)</Label>
            <Textarea id="address_en" name="address_en" defaultValue={company.address_en || ""} rows={2} />
          </div>

          <h4 className="font-medium pt-2">ผู้ติดต่อฝ่ายจัดซื้อ</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="procurement_contact_name">ชื่อ</Label>
              <Input id="procurement_contact_name" name="procurement_contact_name" defaultValue={company.procurement_contact_name || ""} />
            </div>
            <div>
              <Label htmlFor="procurement_contact_position">ตำแหน่ง</Label>
              <Input id="procurement_contact_position" name="procurement_contact_position" defaultValue={company.procurement_contact_position || ""} />
            </div>
            <div>
              <Label htmlFor="procurement_contact_phone">โทรศัพท์</Label>
              <Input id="procurement_contact_phone" name="procurement_contact_phone" defaultValue={company.procurement_contact_phone || ""} />
            </div>
            <div>
              <Label htmlFor="procurement_contact_email">อีเมล</Label>
              <Input id="procurement_contact_email" name="procurement_contact_email" defaultValue={company.procurement_contact_email || ""} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
