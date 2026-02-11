import { getApprovalDelegations } from "@/lib/actions/delegation";
import { getCompanyMembers } from "@/lib/actions/company";
import { DelegationManager } from "@/components/settings/delegation-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { GitBranch } from "lucide-react";

export default async function DelegationPage() {
  const [delegations, members] = await Promise.all([
    getApprovalDelegations(),
    getCompanyMembers(),
  ]);

  return (
    <>
      <SettingsPageHeader icon={GitBranch} title="มอบอำนาจ" description="จัดการการมอบอำนาจอนุมัติ" />
      <DelegationManager delegations={delegations as any} members={members as any} />
    </>
  );
}
