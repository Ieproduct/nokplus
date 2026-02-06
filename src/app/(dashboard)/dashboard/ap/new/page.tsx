import { getApprovedVendors } from "@/lib/actions/vendor";
import { getPurchaseOrders } from "@/lib/actions/po";
import { getDocumentSettingsConfig } from "@/lib/config/loader";
import { getDepartments, getCostCenters } from "@/lib/actions/department";
import { APForm } from "@/components/ap-form";

export default async function NewAPPage() {
  const docConfig = getDocumentSettingsConfig();

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
      <div>
        <h1 className="text-2xl font-bold">สร้างใบสำคัญจ่าย</h1>
        <p className="text-muted-foreground">สร้าง Accounts Payable Voucher (AP) ใหม่</p>
      </div>
      <APForm
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, code: v.code }))}
        approvedPOs={approvedPOs}
        departments={departments.map((d) => ({ code: d.code, name: d.name }))}
        costCenters={costCenters.map((c) => ({ code: c.code, name: c.name }))}
        units={docConfig.units}
      />
    </div>
  );
}
