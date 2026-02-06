import { getApVoucher } from "@/lib/actions/ap";
import { getApprovedVendors } from "@/lib/actions/vendor";
import { getPurchaseOrders } from "@/lib/actions/po";
import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { APForm } from "@/components/ap-form";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function APDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const docConfig = getDocumentSettingsConfig();

  let ap;
  try {
    ap = await getApVoucher(id);
  } catch {
    notFound();
  }

  let vendors: Awaited<ReturnType<typeof getApprovedVendors>> = [];
  let pos: Awaited<ReturnType<typeof getPurchaseOrders>> = [];
  try {
    [vendors, pos] = await Promise.all([getApprovedVendors(), getPurchaseOrders()]);
  } catch {
    // empty
  }

  const approvedPOs = pos
    .filter((po) => po.status === "approved")
    .map((po) => ({ id: po.id, document_number: po.document_number, title: po.title }));

  const [departments, costCenters] = await Promise.all([
    getDepartments(),
    getCostCenters(),
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
        units={docConfig.units}
      />
    </div>
  );
}
