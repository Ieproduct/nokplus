import { getVendor } from "@/lib/actions/vendor";
import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { VendorForm } from "@/components/vendor-form";
import { notFound } from "next/navigation";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const config = getDocumentSettingsConfig();

  let vendor;
  try {
    vendor = await getVendor(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">แก้ไขผู้ขาย</h1>
        <p className="text-muted-foreground">{vendor.name} ({vendor.code})</p>
      </div>
      <VendorForm vendor={vendor} paymentTerms={config.payment_terms} />
    </div>
  );
}
