import { getOrganizationLevels, getOrganizationMembers } from "@/lib/actions/organization";
import { OrgChart } from "@/components/settings/org-chart";
import { OrgStructureManager } from "@/components/settings/org-structure-manager";
import { Network } from "lucide-react";

export default async function OrganizationPage() {
  const [levels, members] = await Promise.all([
    getOrganizationLevels(),
    getOrganizationMembers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Network className="h-6 w-6 text-nok-blue" />
        <div>
          <h1 className="text-2xl font-bold">โครงสร้างองค์กร</h1>
          <p className="text-sm text-muted-foreground">
            จัดการระดับตำแหน่ง L1-L9 และกำหนดระดับให้สมาชิก
          </p>
        </div>
      </div>

      <OrgChart levels={levels} />
      <OrgStructureManager levels={levels} members={members} />
    </div>
  );
}
