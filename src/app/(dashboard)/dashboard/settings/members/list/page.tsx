import { getCompanyMembers } from "@/lib/actions/company";
import { MemberManager } from "@/components/settings/member-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Users } from "lucide-react";

export default async function MembersListPage() {
  const members = await getCompanyMembers();

  return (
    <>
      <SettingsPageHeader icon={Users} title="รายชื่อสมาชิก" description="จัดการสมาชิกในบริษัท" />
      <MemberManager members={members as any} />
    </>
  );
}
