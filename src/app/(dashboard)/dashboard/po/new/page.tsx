import { getApprovedVendors } from "@/lib/actions/vendor";
import { getApprovedPRs } from "@/lib/actions/pr";
import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getMyCompanies } from "@/lib/actions/company";
import { getActiveCompanyId } from "@/lib/company-context";
import { POForm } from "@/components/po-form";

export default async function NewPOPage({
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

  let vendors: Awaited<ReturnType<typeof getApprovedVendors>> = [];
  let approvedPRs: Awaited<ReturnType<typeof getApprovedPRs>> = [];
  try {
    [vendors, approvedPRs] = await Promise.all([
      getApprovedVendors(selectedCompanyId),
      getApprovedPRs(selectedCompanyId),
    ]);
  } catch { /* empty */ }

  const [departments, costCenters] = await Promise.all([
    getDepartments(selectedCompanyId),
    getCostCenters(selectedCompanyId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สร้างใบสั่งซื้อ</h1>
        <p className="text-muted-foreground">สร้าง Purchase Order (PO) ใหม่</p>
      </div>
      <POForm
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, code: v.code }))}
        approvedPRs={approvedPRs.map((pr) => ({ id: pr.id, document_number: pr.document_number, title: pr.title }))}
        departments={departments.map((d) => ({ code: d.code, name: d.name }))}
        costCenters={costCenters.map((c) => ({ code: c.code, name: c.name }))}
        units={docConfig.units}
        paymentTerms={docConfig.payment_terms}
        companies={companies.map((c) => ({ id: c.companies!.id, name: c.companies!.name_th }))}
        selectedCompanyId={selectedCompanyId}
      />
    </div>
  );
}
