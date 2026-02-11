import { getVendorGroups } from "@/lib/actions/vendor-config";
import { VendorGroupManager } from "@/components/settings/vendor-group-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Tags } from "lucide-react";

export default async function VendorGroupsPage() {
  const groups = await getVendorGroups();

  return (
    <>
      <SettingsPageHeader icon={Tags} title="กลุ่มผู้ขาย" description="จัดประเภทผู้ขายและกำหนดค่าเริ่มต้น" />
      <VendorGroupManager groups={groups} />
    </>
  );
}
