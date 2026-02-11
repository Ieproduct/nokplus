import { getApprovedPOsForGR } from "@/lib/actions/gr";
import { getFieldControls } from "@/lib/actions/enterprise-lookup";
import { GRForm } from "@/components/gr-form";

export default async function NewGRPage() {
  let approvedPOs: Awaited<ReturnType<typeof getApprovedPOsForGR>> = [];
  try {
    approvedPOs = await getApprovedPOsForGR();
  } catch { /* empty */ }

  const fieldControls = await getFieldControls("gr");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สร้างใบรับสินค้า</h1>
        <p className="text-muted-foreground">สร้าง Goods Receipt (GR) ใหม่</p>
      </div>
      <GRForm
        approvedPOs={approvedPOs.map((po) => ({
          id: po.id,
          document_number: po.document_number,
          title: po.title,
          vendors: (po as any).vendors || null,
        }))}
        fieldControls={fieldControls}
      />
    </div>
  );
}
