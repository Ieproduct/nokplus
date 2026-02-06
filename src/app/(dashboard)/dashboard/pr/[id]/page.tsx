import { getPurchaseRequisition } from "@/lib/actions/pr";
import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
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
  const docConfig = getDocumentSettingsConfig();

  let pr;
  try {
    pr = await getPurchaseRequisition(id);
  } catch {
    notFound();
  }

  const [departments, costCenters] = await Promise.all([
    getDepartments(),
    getCostCenters(),
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
        units={docConfig.units}
      />
    </div>
  );
}
