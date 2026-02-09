import { getFullDashboardStats, getDepartmentList } from "@/lib/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ShoppingCart,
  Receipt,
  CheckSquare,
  Users,
  Building2,
  FileStack,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { DashboardFilters } from "@/components/dashboard-filters";
import { DashboardChart } from "@/components/dashboard-chart";
import { ActivityFeed } from "@/components/activity-feed";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;

  let stats: Awaited<ReturnType<typeof getFullDashboardStats>> | null = null;
  let departments: string[] = [];

  try {
    [stats, departments] = await Promise.all([
      getFullDashboardStats({
        department: params.department,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      }),
      getDepartmentList(),
    ]);
  } catch {
    // fallback
  }

  const overview = stats?.overview || { memberCount: 0, departmentCount: 0, totalDocuments: 0 };
  const moduleStats = stats?.moduleStats || {
    pr: { total: 0, draft: 0, pending: 0, approved: 0 },
    po: { total: 0, draft: 0, pending: 0, approved: 0 },
    ap: { total: 0, draft: 0, pending: 0, unpaid: 0, paid: 0 },
    vendors: 0,
    pendingApprovals: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nok-blue/10">
          <LayoutDashboard className="h-5 w-5 text-nok-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-nok-navy">ข้อมูลสถิติภาพรวม</h1>
          <p className="text-muted-foreground text-sm">ภาพรวมระบบจัดซื้อจัดจ้าง</p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters departments={departments} />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-l-4 border-l-nok-blue">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nok-blue/10">
              <Users className="h-6 w-6 text-nok-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">บุคลากร</p>
              <p className="text-3xl font-bold text-nok-navy">{overview.memberCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-nok-success">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Building2 className="h-6 w-6 text-nok-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">แผนก</p>
              <p className="text-3xl font-bold text-nok-navy">{overview.departmentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <FileStack className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">เอกสารทั้งหมด</p>
              <p className="text-3xl font-bold text-nok-navy">{overview.totalDocuments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-Column: Chart + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardChart data={stats?.departmentUsage || []} />
        <ActivityFeed activities={stats?.recentActivity || []} />
      </div>

      {/* Module Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/dashboard/pr">
          <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-nok-blue overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ใบขอซื้อ (PR)</CardTitle>
              <FileText className="h-5 w-5 text-nok-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nok-navy">{moduleStats.pr.total}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{moduleStats.pr.draft} ร่าง</Badge>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">{moduleStats.pr.pending} รออนุมัติ</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/po">
          <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-nok-success overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ใบสั่งซื้อ (PO)</CardTitle>
              <ShoppingCart className="h-5 w-5 text-nok-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nok-navy">{moduleStats.po.total}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{moduleStats.po.draft} ร่าง</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">{moduleStats.po.approved} อนุมัติ</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/ap">
          <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ใบสำคัญจ่าย (AP)</CardTitle>
              <Receipt className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nok-navy">{moduleStats.ap.total}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">{moduleStats.ap.unpaid} ยังไม่จ่าย</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">{moduleStats.ap.paid} จ่ายแล้ว</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vendors">
          <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500 overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ผู้ขาย</CardTitle>
              <Users className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nok-navy">{moduleStats.vendors}</div>
              <p className="text-xs text-muted-foreground mt-2">ผู้ขายทั้งหมดในระบบ</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/approvals">
          <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-nok-warning overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">รออนุมัติ</CardTitle>
              <CheckSquare className="h-5 w-5 text-nok-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nok-navy">{moduleStats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground mt-2">รายการที่รอการอนุมัติ</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
