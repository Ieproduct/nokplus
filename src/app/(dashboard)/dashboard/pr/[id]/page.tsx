import { getPurchaseRequisition } from "@/lib/actions/pr";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getActiveUnits, getActivePurchasingOrgs, getActiveCurrencies, getActiveTaxRates, getFieldControls } from "@/lib/actions/enterprise-lookup";
import { getRevisions } from "@/lib/actions/revision";
import { RevisionHistory } from "@/components/revision-history";
import { PRForm } from "@/components/pr-form";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function PRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let pr;
  try {
    pr = await getPurchaseRequisition(id);
  } catch {
    notFound();
  }

  const companyId = pr.company_id ?? undefined;

  const [departments, costCenters, units, purchasingOrgs, currencies, taxConfigs, fieldControls, revisions] = await Promise.all([
    getDepartments(companyId),
    getCostCenters(companyId),
    getActiveUnits(companyId),
    getActivePurchasingOrgs(companyId),
    getActiveCurrencies(companyId),
    getActiveTaxRates(companyId),
    getFieldControls("pr", companyId),
    getRevisions("pr", id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{pr.document_number}</h1>
          <p className="text-muted-foreground">{pr.title}</p>
        </div>
        <Badge className={STATUS_COLORS[pr.status || "draft"]}>
          {STATUS_LABELS[pr.status || "draft"]}
        </Badge>
      </div>
      <PRForm
        pr={pr}
        departments={departments.map((d) => ({ code: d.code, name: d.name }))}
        costCenters={costCenters.map((c) => ({ code: c.code, name: c.name }))}
        units={units.map((u) => ({ code: u.code, name: u.name }))}
        purchasingOrgs={purchasingOrgs.map((o) => ({ id: o.id, code: o.code, name: o.name }))}
        currencies={currencies.map((c) => ({ code: c.code, name: c.name, exchange_rate: c.exchange_rate }))}
        taxConfigs={taxConfigs.map((t) => ({ code: t.code, label: t.label, rate: t.rate, tax_type: t.tax_type }))}
        fieldControls={fieldControls}
      />
      <RevisionHistory revisions={revisions} />
    </div>
  );
}
