import { getApprovalTiers } from "@/lib/actions/flow";
import { getCompanyMembers } from "@/lib/actions/company";
import { ApprovalTierManager } from "@/components/settings/approval-tier-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Workflow } from "lucide-react";

export default async function ApprovalTiersPage() {
  const [tiers, members] = await Promise.all([
    getApprovalTiers(),
    getCompanyMembers(),
  ]);

  return (
    <>
      <SettingsPageHeader icon={Workflow} title="ระดับอนุมัติ" description="กำหนดระดับวงเงินอนุมัติ" />
      <ApprovalTierManager tiers={tiers} members={members} />
    </>
  );
}
