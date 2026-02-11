import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getMyCompanies } from "@/lib/actions/company";
import { getActiveCompanyId } from "@/lib/company-context";
import { getActiveUnits, getActivePurchasingOrgs, getActiveCurrencies, getActiveTaxRates, getFieldControls } from "@/lib/actions/enterprise-lookup";
import { PRForm } from "@/components/pr-form";

export default async function NewPRPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;

  const [companies, activeCompanyId] = await Promise.all([
    getMyCompanies(),
    getActiveCompanyId(),
  ]);

  const selectedCompanyId = params.company || activeCompanyId;

  const [departments, costCenters, units, purchasingOrgs, currencies, taxConfigs, fieldControls] = await Promise.all([
    getDepartments(selectedCompanyId),
    getCostCenters(selectedCompanyId),
    getActiveUnits(selectedCompanyId),
    getActivePurchasingOrgs(selectedCompanyId),
    getActiveCurrencies(selectedCompanyId),
    getActiveTaxRates(selectedCompanyId),
    getFieldControls("pr", selectedCompanyId),
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
        units={units.map((u) => ({ code: u.code, name: u.name }))}
        companies={companies.map((c) => ({ id: c.companies!.id, name: c.companies!.name_th }))}
        selectedCompanyId={selectedCompanyId}
        purchasingOrgs={purchasingOrgs.map((o) => ({ id: o.id, code: o.code, name: o.name }))}
        currencies={currencies.map((c) => ({ code: c.code, name: c.name, exchange_rate: c.exchange_rate }))}
        taxConfigs={taxConfigs.map((t) => ({ code: t.code, label: t.label, rate: t.rate, tax_type: t.tax_type }))}
        fieldControls={fieldControls}
      />
    </div>
  );
}
