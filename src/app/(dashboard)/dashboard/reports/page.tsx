import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BarChart3, FileText, ShoppingCart, Receipt, DollarSign } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: prs } = await supabase
    .from("purchase_requisitions")
    .select("status, total_amount, department");

  const { data: pos } = await supabase
    .from("purchase_orders")
    .select("status, net_amount, department");

  const { data: aps } = await supabase
    .from("ap_vouchers")
    .select("status, payment_status, net_amount, department");

  const prTotal = (prs || []).reduce((sum, pr) => sum + (pr.total_amount || 0), 0);
  const poTotal = (pos || []).reduce((sum, po) => sum + (po.net_amount || 0), 0);
  const apTotal = (aps || []).reduce((sum, ap) => sum + (ap.net_amount || 0), 0);
  const apPaid = (aps || [])
    .filter((ap) => ap.payment_status === "paid")
    .reduce((sum, ap) => sum + (ap.net_amount || 0), 0);

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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nok-blue/10">
          <BarChart3 className="h-5 w-5 text-nok-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-nok-navy">รายงาน</h1>
          <p className="text-muted-foreground text-sm">สรุปข้อมูลจัดซื้อจัดจ้าง</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-l-4 border-l-nok-blue">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม PR</CardTitle>
              <FileText className="h-4 w-4 text-nok-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-nok-navy">{formatCurrency(prTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{(prs || []).length} รายการ</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-nok-success">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม PO</CardTitle>
              <ShoppingCart className="h-4 w-4 text-nok-success" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-nok-navy">{formatCurrency(poTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{(pos || []).length} รายการ</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม AP</CardTitle>
              <Receipt className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-nok-navy">{formatCurrency(apTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{(aps || []).length} รายการ</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">จ่ายแล้ว</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-nok-success">{formatCurrency(apPaid)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(aps || []).filter((ap) => ap.payment_status === "paid").length} รายการ
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-linear-to-r from-nok-navy to-nok-blue text-white">
          <CardTitle className="text-white">สรุปตามแผนก</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>แผนก</TableHead>
                <TableHead className="text-right">ยอด PR</TableHead>
                <TableHead className="text-right">ยอด PO</TableHead>
                <TableHead className="text-right">ยอด AP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(deptMap).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                    ยังไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(deptMap).map(([dept, amounts]) => (
                  <TableRow key={dept} className="hover:bg-blue-50/50">
                    <TableCell className="font-medium text-nok-navy">{dept}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(amounts.pr)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(amounts.po)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(amounts.ap)}</TableCell>
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
