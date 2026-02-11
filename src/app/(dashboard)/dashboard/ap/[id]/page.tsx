import { getApVoucher } from "@/lib/actions/ap";
import { getApprovedVendors } from "@/lib/actions/vendor";
import { getPurchaseOrders } from "@/lib/actions/po";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { getActiveUnits, getActiveTaxRates, getFieldControls } from "@/lib/actions/enterprise-lookup";
import { getRevisions } from "@/lib/actions/revision";
import { APForm } from "@/components/ap-form";
import { MatchingStatus } from "@/components/matching-status";
import { RevisionHistory } from "@/components/revision-history";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function APDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let ap;
  try {
    ap = await getApVoucher(id);
  } catch {
    notFound();
  }

  const cid = ap.company_id ?? undefined;
  let vendors: Awaited<ReturnType<typeof getApprovedVendors>> = [];
  let pos: Awaited<ReturnType<typeof getPurchaseOrders>> = [];
  try {
    [vendors, pos] = await Promise.all([getApprovedVendors(cid), getPurchaseOrders()]);
  } catch {
    // empty
  }

  const approvedPOs = pos
    .filter((po) => po.status === "approved" && po.company_id === ap.company_id)
    .map((po) => ({ id: po.id, document_number: po.document_number, title: po.title }));

  const [departments, costCenters, units, taxConfigs, fieldControls, revisions] = await Promise.all([
    getDepartments(cid),
    getCostCenters(cid),
    getActiveUnits(cid),
    getActiveTaxRates(cid),
    getFieldControls("ap", cid),
    getRevisions("ap", id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{ap.document_number}</h1>
          <p className="text-muted-foreground">{ap.title}</p>
        </div>
        <Badge className={STATUS_COLORS[ap.status || "draft"]}>
          {STATUS_LABELS[ap.status || "draft"]}
        </Badge>
        <Badge className={STATUS_COLORS[ap.payment_status || "unpaid"]}>
          {PAYMENT_STATUS_LABELS[ap.payment_status || "unpaid"]}
        </Badge>
      </div>
      <APForm
        ap={ap}
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, code: v.code }))}
        approvedPOs={approvedPOs}
        departments={departments.map((d) => ({ code: d.code, name: d.name }))}
        costCenters={costCenters.map((c) => ({ code: c.code, name: c.name }))}
        units={units.map((u) => ({ code: u.code, label: u.name }))}
        fieldControls={fieldControls}
      />
      {ap.po_id && (
        <MatchingStatus
          apId={ap.id}
          matchingStatus={ap.matching_status}
          matchingResult={ap.matching_result}
        />
      )}
      <RevisionHistory revisions={revisions} />
    </div>
  );
}
