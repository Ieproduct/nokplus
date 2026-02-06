import { getPurchaseOrder } from "@/lib/actions/po";
import { getApprovedVendors } from "@/lib/actions/vendor";
import { getApprovedPRs } from "@/lib/actions/pr";
import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { POForm } from "@/components/po-form";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const docConfig = getDocumentSettingsConfig();

  let po;
  try { po = await getPurchaseOrder(id); } catch { notFound(); }

  let vendors: Awaited<ReturnType<typeof getApprovedVendors>> = [];
  let approvedPRs: Awaited<ReturnType<typeof getApprovedPRs>> = [];
  try { [vendors, approvedPRs] = await Promise.all([getApprovedVendors(), getApprovedPRs()]); } catch { /* */ }

  const [departments, costCenters] = await Promise.all([
    getDepartments(),
    getCostCenters(),
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
        units={docConfig.units}
        paymentTerms={docConfig.payment_terms}
      />
    </div>
  );
}
