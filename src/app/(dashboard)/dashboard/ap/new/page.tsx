import { getApprovedVendors } from "@/lib/actions/vendor";
import { getPurchaseOrders } from "@/lib/actions/po";
import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getMyCompanies } from "@/lib/actions/company";
import { getActiveCompanyId } from "@/lib/company-context";
import { APForm } from "@/components/ap-form";

export default async function NewAPPage({
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
  let pos: Awaited<ReturnType<typeof getPurchaseOrders>> = [];
  try {
    [vendors, pos] = await Promise.all([
      getApprovedVendors(selectedCompanyId),
      getPurchaseOrders(),
    ]);
  } catch {
    // empty
  }

  const approvedPOs = pos
    .filter((po) => po.status === "approved" && po.company_id === selectedCompanyId)
    .map((po) => ({ id: po.id, document_number: po.document_number, title: po.title }));

  const [departments, costCenters] = await Promise.all([
    getDepartments(selectedCompanyId),
    getCostCenters(selectedCompanyId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สร้างใบสำคัญจ่าย</h1>
        <p className="text-muted-foreground">สร้าง Accounts Payable Voucher (AP) ใหม่</p>
      </div>
      <APForm
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, code: v.code }))}
        approvedPOs={approvedPOs}
        departments={departments.map((d) => ({ code: d.code, name: d.name }))}
        costCenters={costCenters.map((c) => ({ code: c.code, name: c.name }))}
        units={docConfig.units}
        companies={companies.map((c) => ({ id: c.companies!.id, name: c.companies!.name_th }))}
        selectedCompanyId={selectedCompanyId}
      />
    </div>
  );
}
