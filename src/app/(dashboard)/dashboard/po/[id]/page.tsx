import { getPurchaseOrder } from "@/lib/actions/po";
import { getApprovedVendors } from "@/lib/actions/vendor";
import { getApprovedPRs } from "@/lib/actions/pr";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getActiveUnits, getActivePaymentTerms, getActivePurchasingOrgs, getActiveCurrencies, getActiveTaxRates, getFieldControls } from "@/lib/actions/enterprise-lookup";
import { getRevisions } from "@/lib/actions/revision";
import { RevisionHistory } from "@/components/revision-history";
import { POForm } from "@/components/po-form";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let po;
  try { po = await getPurchaseOrder(id); } catch { notFound(); }

  let vendors: Awaited<ReturnType<typeof getApprovedVendors>> = [];
  let approvedPRs: Awaited<ReturnType<typeof getApprovedPRs>> = [];
  const cid = po.company_id ?? undefined;
  try { [vendors, approvedPRs] = await Promise.all([getApprovedVendors(cid), getApprovedPRs(cid)]); } catch { /* */ }

  const [departments, costCenters, units, paymentTerms, purchasingOrgs, currencies, taxConfigs, fieldControls, revisions] = await Promise.all([
    getDepartments(cid),
    getCostCenters(cid),
    getActiveUnits(cid),
    getActivePaymentTerms(cid),
    getActivePurchasingOrgs(cid),
    getActiveCurrencies(cid),
    getActiveTaxRates(cid),
    getFieldControls("po", cid),
    getRevisions("po", id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{po.document_number}</h1>
          <p className="text-muted-foreground">{po.title}</p>
        </div>
        <Badge className={STATUS_COLORS[po.status || "draft"]}>{STATUS_LABELS[po.status || "draft"]}</Badge>
      </div>
      <POForm
        po={po}
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, code: v.code }))}
        approvedPRs={approvedPRs.map((pr) => ({ id: pr.id, document_number: pr.document_number, title: pr.title }))}
        departments={departments.map((d) => ({ code: d.code, name: d.name }))}
        costCenters={costCenters.map((c) => ({ code: c.code, name: c.name }))}
        units={units.map((u) => ({ code: u.code, name: u.name }))}
        paymentTerms={paymentTerms.map((p) => ({ code: p.code, name: p.name }))}
        purchasingOrgs={purchasingOrgs.map((o) => ({ id: o.id, code: o.code, name: o.name }))}
        currencies={currencies.map((c) => ({ code: c.code, name: c.name, exchange_rate: c.exchange_rate }))}
        taxConfigs={taxConfigs.map((t) => ({ code: t.code, label: t.label, rate: t.rate, tax_type: t.tax_type }))}
        fieldControls={fieldControls}
      />
      <RevisionHistory revisions={revisions} />
    </div>
  );
}
