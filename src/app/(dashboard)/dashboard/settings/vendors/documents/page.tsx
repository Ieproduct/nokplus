import { getVendorDocumentRequirements } from "@/lib/actions/vendor-config";
import { VendorDocManager } from "@/components/settings/vendor-doc-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { FileCheck } from "lucide-react";

export default async function VendorDocumentsPage() {
  const documents = await getVendorDocumentRequirements();

  return (
    <>
      <SettingsPageHeader icon={FileCheck} title="เอกสารผู้ขาย" description="กำหนดเอกสารที่ต้องมีสำหรับผู้ขาย" />
      <VendorDocManager documents={documents} />
    </>
  );
}
