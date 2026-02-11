import { getAllDepartments } from "@/lib/actions/department";
import { DepartmentManager } from "@/components/settings/department-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Building2 } from "lucide-react";

export default async function DepartmentsPage() {
  const departments = await getAllDepartments();

  return (
    <>
      <SettingsPageHeader icon={Building2} title="แผนก" description="จัดการแผนกในองค์กร" />
      <DepartmentManager departments={departments} />
    </>
  );
}
