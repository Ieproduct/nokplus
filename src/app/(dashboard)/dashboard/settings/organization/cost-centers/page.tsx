import { getAllCostCenters } from "@/lib/actions/department";
import { CostCenterManager } from "@/components/settings/cost-center-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Tags } from "lucide-react";

export default async function CostCentersPage() {
  const costCenters = await getAllCostCenters();

  return (
    <>
      <SettingsPageHeader icon={Tags} title="Cost Center" description="จัดการศูนย์ต้นทุน" />
      <CostCenterManager costCenters={costCenters} />
    </>
  );
}
