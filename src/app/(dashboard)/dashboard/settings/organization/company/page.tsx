import { getActiveCompany } from "@/lib/actions/company";
import { CompanyForm } from "@/components/settings/company-form";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Building } from "lucide-react";

export default async function CompanySettingsPage() {
  const company = await getActiveCompany();

  return (
    <>
      <SettingsPageHeader icon={Building} title="ข้อมูลบริษัท" description="จัดการข้อมูลพื้นฐานบริษัท" />
      <CompanyForm company={company} />
    </>
  );
}
