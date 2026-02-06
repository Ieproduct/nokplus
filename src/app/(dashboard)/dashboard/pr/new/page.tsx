import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { PRForm } from "@/components/pr-form";

export default async function NewPRPage() {
  const docConfig = getDocumentSettingsConfig();
  const [departments, costCenters] = await Promise.all([
    getDepartments(),
    getCostCenters(),
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
        units={docConfig.units}
      />
    </div>
  );
}
