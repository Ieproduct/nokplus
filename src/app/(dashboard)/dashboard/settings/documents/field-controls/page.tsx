import { getFieldControls } from "@/lib/actions/document-config";
import { FieldControlManager } from "@/components/settings/field-control-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { LayoutGrid } from "lucide-react";

export default async function FieldControlsPage() {
  const controls = await getFieldControls();

  return (
    <>
      <SettingsPageHeader icon={LayoutGrid} title="การควบคุมฟิลด์" description="กำหนดฟิลด์ที่จำเป็น/แสดง/แก้ไขได้ต่อประเภทเอกสาร" />
      <FieldControlManager controls={controls} />
    </>
  );
}
