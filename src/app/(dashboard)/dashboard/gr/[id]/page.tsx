import { getGoodsReceipt } from "@/lib/actions/gr";
import { getFieldControls } from "@/lib/actions/enterprise-lookup";
import { getRevisions } from "@/lib/actions/revision";
import { GRForm } from "@/components/gr-form";
import { RevisionHistory } from "@/components/revision-history";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

const GR_STATUS_LABELS: Record<string, string> = {
  draft: "ร่าง",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิก",
};

const GR_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function GRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let gr;
  try {
    gr = await getGoodsReceipt(id);
  } catch {
    notFound();
  }

  const [fieldControls, revisions] = await Promise.all([
    getFieldControls("gr", gr.company_id ?? undefined),
    getRevisions("gr", id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{gr.document_number}</h1>
          <p className="text-muted-foreground">
            ใบรับสินค้าสำหรับ {(gr as any).purchase_orders?.document_number || ""}
          </p>
        </div>
        <Badge className={GR_STATUS_COLORS[gr.status] || "bg-gray-100 text-gray-700"}>
          {GR_STATUS_LABELS[gr.status] || gr.status}
        </Badge>
      </div>
      <GRForm
        gr={gr}
        approvedPOs={[]}
        fieldControls={fieldControls}
      />
      <RevisionHistory revisions={revisions} />
    </div>
  );
}
