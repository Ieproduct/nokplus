import { getApprovedVendors } from "@/lib/actions/vendor";
import { getApprovedPRs } from "@/lib/actions/pr";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getMyCompanies } from "@/lib/actions/company";
import { getActiveCompanyId } from "@/lib/company-context";
import { getActiveUnits, getActivePaymentTerms, getActivePurchasingOrgs, getActiveCurrencies, getActiveTaxRates, getFieldControls } from "@/lib/actions/enterprise-lookup";
import { POForm } from "@/components/po-form";

export default async function NewPOPage({
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

  let vendors: Awaited<ReturnType<typeof getApprovedVendors>> = [];
  let approvedPRs: Awaited<ReturnType<typeof getApprovedPRs>> = [];
  try {
    [vendors, approvedPRs] = await Promise.all([
      getApprovedVendors(selectedCompanyId),
      getApprovedPRs(selectedCompanyId),
    ]);
  } catch { /* empty */ }

  const [departments, costCenters, units, paymentTerms, purchasingOrgs, currencies, taxConfigs, fieldControls] = await Promise.all([
    getDepartments(selectedCompanyId),
    getCostCenters(selectedCompanyId),
    getActiveUnits(selectedCompanyId),
    getActivePaymentTerms(selectedCompanyId),
    getActivePurchasingOrgs(selectedCompanyId),
    getActiveCurrencies(selectedCompanyId),
    getActiveTaxRates(selectedCompanyId),
    getFieldControls("po", selectedCompanyId),
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
        units={units.map((u) => ({ code: u.code, name: u.name }))}
        paymentTerms={paymentTerms.map((p) => ({ code: p.code, name: p.name }))}
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
