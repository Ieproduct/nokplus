import { getDocumentNumberRanges } from "@/lib/actions/document-config";
import { DocumentNumberManager } from "@/components/settings/document-number-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { FileText } from "lucide-react";

export default async function NumberRangesPage() {
  const ranges = await getDocumentNumberRanges();

  return (
    <>
      <SettingsPageHeader icon={FileText} title="เลขที่เอกสาร" description="กำหนดรูปแบบและเลขที่เอกสาร" />
      <DocumentNumberManager ranges={ranges} />
    </>
  );
}
