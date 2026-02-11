import { getOrganizationLevels } from "@/lib/actions/organization";
import { getCompanyMembers, getMyCompanies } from "@/lib/actions/company";
import { getAllDepartments } from "@/lib/actions/department";
import { OrgStructureManager } from "@/components/settings/org-structure-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { UserCog } from "lucide-react";

export default async function OrgLevelsPage() {
  const [levels, members, companiesRaw, departments] = await Promise.all([
    getOrganizationLevels(),
    getCompanyMembers(),
    getMyCompanies(),
    getAllDepartments(),
  ]);

  const companies = companiesRaw.map((c: any) => ({
    id: c.companies?.id ?? c.company_id,
    name_th: c.companies?.name_th ?? "",
    name_en: c.companies?.name_en ?? null,
  }));

  return (
    <>
      <SettingsPageHeader icon={UserCog} title="ระดับองค์กร" description="กำหนดระดับตำแหน่งในองค์กร" />
      <OrgStructureManager levels={levels} members={members as any} companies={companies} departments={departments} />
    </>
  );
}
