import { getDashboardStats } from "@/lib/actions/approval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ShoppingCart, Receipt, CheckSquare, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  let stats = {
    pr: { total: 0, draft: 0, pending: 0, approved: 0 },
    po: { total: 0, draft: 0, pending: 0, approved: 0 },
    ap: { total: 0, draft: 0, pending: 0, unpaid: 0, paid: 0 },
    pendingApprovals: 0,
  };

  try {
    stats = await getDashboardStats();
  } catch {
    // Stats will use defaults
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">ภาพรวมระบบจัดซื้อจัดจ้าง</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/pr">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใบขอซื้อ (PR)</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pr.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{stats.pr.draft} ร่าง</Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {stats.pr.pending} รออนุมัติ
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/po">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใบสั่งซื้อ (PO)</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.po.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{stats.po.draft} ร่าง</Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {stats.po.approved} อนุมัติ
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/ap">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใบสำคัญจ่าย (AP)</CardTitle>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ap.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.ap.unpaid} ยังไม่จ่าย
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {stats.ap.paid} จ่ายแล้ว
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/approvals">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground mt-2">
                รายการที่รอการอนุมัติ
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href="/dashboard/pr/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">สร้างใบขอซื้อ</p>
                <p className="text-sm text-muted-foreground">สร้าง PR ใหม่</p>
              </div>
            </Link>
            <Link
              href="/dashboard/po/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">สร้างใบสั่งซื้อ</p>
                <p className="text-sm text-muted-foreground">สร้าง PO ใหม่</p>
              </div>
            </Link>
            <Link
              href="/dashboard/vendors/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">เพิ่มผู้ขาย</p>
                <p className="text-sm text-muted-foreground">ลงทะเบียนผู้ขายใหม่</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
