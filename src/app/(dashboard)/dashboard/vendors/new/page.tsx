import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { VendorForm } from "@/components/vendor-form";

export default function NewVendorPage() {
  const config = getDocumentSettingsConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">เพิ่มผู้ขาย</h1>
        <p className="text-muted-foreground">ลงทะเบียนผู้ขาย/ผู้ให้บริการรายใหม่</p>
      </div>
      <VendorForm paymentTerms={config.payment_terms} />
    </div>
  );
}
