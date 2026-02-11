import { getApChecklistItems } from "@/lib/actions/vendor-config";
import { ApChecklistManager } from "@/components/settings/ap-checklist-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { ClipboardList } from "lucide-react";

export default async function ApChecklistPage() {
  const items = await getApChecklistItems();

  return (
    <>
      <SettingsPageHeader icon={ClipboardList} title="AP Checklist" description="รายการตรวจสอบก่อนจ่ายเงิน" />
      <ApChecklistManager items={items} />
    </>
  );
}
