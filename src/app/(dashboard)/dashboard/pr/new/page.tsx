import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getMyCompanies } from "@/lib/actions/company";
import { getActiveCompanyId } from "@/lib/company-context";
import { PRForm } from "@/components/pr-form";

export default async function NewPRPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const docConfig = getDocumentSettingsConfig();

  const [companies, activeCompanyId] = await Promise.all([
    getMyCompanies(),
    getActiveCompanyId(),
  ]);

  const selectedCompanyId = params.company || activeCompanyId;

  const [departments, costCenters] = await Promise.all([
    getDepartments(selectedCompanyId),
    getCostCenters(selectedCompanyId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สร้างใบขอซื้อ</h1>
        <p className="text-muted-foreground">สร้าง Purchase Requisition (PR) ใหม่</p>
      </div>
      <PRForm
        departments={departments.map((d) => ({ code: d.code, name: d.name }))}
        costCenters={costCenters.map((c) => ({ code: c.code, name: c.name }))}
        units={docConfig.units}
        companies={companies.map((c) => ({ id: c.companies!.id, name: c.companies!.name_th }))}
        selectedCompanyId={selectedCompanyId}
      />
    </div>
  );
}
