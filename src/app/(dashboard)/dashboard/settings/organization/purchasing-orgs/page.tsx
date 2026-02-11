import { getPurchasingOrganizations } from "@/lib/actions/purchasing-org";
import { PurchasingOrgManager } from "@/components/settings/purchasing-org-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Network } from "lucide-react";

export default async function PurchasingOrgsPage() {
  const organizations = await getPurchasingOrganizations();

  return (
    <>
      <SettingsPageHeader icon={Network} title="หน่วยจัดซื้อ" description="จัดการโครงสร้างหน่วยจัดซื้อ" />
      <PurchasingOrgManager organizations={organizations} />
    </>
  );
}
