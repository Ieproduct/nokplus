import { getApprovalFlows, getApprovalTiers } from "@/lib/actions/flow";
import { getCompanyMembers } from "@/lib/actions/company";
import { ApprovalFlowList } from "@/components/settings/approval-flow-list";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { GitBranch } from "lucide-react";

export default async function ApprovalFlowsPage() {
  const [flows, tiers, members] = await Promise.all([
    getApprovalFlows(),
    getApprovalTiers(),
    getCompanyMembers(),
  ]);

  return (
    <>
      <SettingsPageHeader icon={GitBranch} title="สายอนุมัติ" description="กำหนดขั้นตอนการอนุมัติเอกสาร" />
      <ApprovalFlowList flows={flows} tiers={tiers} members={members as any} />
    </>
  );
}
