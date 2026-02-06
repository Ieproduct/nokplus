import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function ReportsPage() {
  const supabase = await createClient();

  // Get PR summary
  const { data: prs } = await supabase
    .from("purchase_requisitions")
    .select("status, total_amount, department");

  // Get PO summary
  const { data: pos } = await supabase
    .from("purchase_orders")
    .select("status, net_amount, department");

  // Get AP summary
  const { data: aps } = await supabase
    .from("ap_vouchers")
    .select("status, payment_status, net_amount, department");

  const prTotal = (prs || []).reduce((sum, pr) => sum + (pr.total_amount || 0), 0);
  const poTotal = (pos || []).reduce((sum, po) => sum + (po.net_amount || 0), 0);
  const apTotal = (aps || []).reduce((sum, ap) => sum + (ap.net_amount || 0), 0);
  const apPaid = (aps || [])
    .filter((ap) => ap.payment_status === "paid")
    .reduce((sum, ap) => sum + (ap.net_amount || 0), 0);

  // By department
  const deptMap: Record<string, { pr: number; po: number; ap: number }> = {};
  (prs || []).forEach((pr) => {
    if (!deptMap[pr.department]) deptMap[pr.department] = { pr: 0, po: 0, ap: 0 };
    deptMap[pr.department].pr += pr.total_amount || 0;
  });
  (pos || []).forEach((po) => {
    if (!deptMap[po.department]) deptMap[po.department] = { pr: 0, po: 0, ap: 0 };
    deptMap[po.department].po += po.net_amount || 0;
  });
  (aps || []).forEach((ap) => {
    if (!deptMap[ap.department]) deptMap[ap.department] = { pr: 0, po: 0, ap: 0 };
    deptMap[ap.department].ap += ap.net_amount || 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">รายงาน</h1>
        <p className="text-muted-foreground">สรุปข้อมูลจัดซื้อจัดจ้าง</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม PR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(prTotal)}</p>
            <p className="text-xs text-muted-foreground">{(prs || []).length} รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม PO</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(poTotal)}</p>
            <p className="text-xs text-muted-foreground">{(pos || []).length} รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม AP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(apTotal)}</p>
            <p className="text-xs text-muted-foreground">{(aps || []).length} รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">จ่ายแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(apPaid)}</p>
            <p className="text-xs text-muted-foreground">
              {(aps || []).filter((ap) => ap.payment_status === "paid").length} รายการ
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สรุปตามแผนก</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>แผนก</TableHead>
                <TableHead className="text-right">ยอด PR</TableHead>
                <TableHead className="text-right">ยอด PO</TableHead>
                <TableHead className="text-right">ยอด AP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(deptMap).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    ยังไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(deptMap).map(([dept, amounts]) => (
                  <TableRow key={dept}>
                    <TableCell className="font-medium">{dept}</TableCell>
                    <TableCell className="text-right">{formatCurrency(amounts.pr)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(amounts.po)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(amounts.ap)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
