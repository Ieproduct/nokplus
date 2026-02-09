import { getPurchaseOrders } from "@/lib/actions/po";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import { hasPermission } from "@/lib/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, ShoppingCart } from "lucide-react";
import { ListFilters } from "@/components/list-filters";

const PO_STATUS_OPTIONS = [
  { value: "draft", label: "ร่าง" },
  { value: "pending_approval", label: "รออนุมัติ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "rejected", label: "ปฏิเสธ" },
  { value: "revision", label: "แก้ไข" },
  { value: "cancelled", label: "ยกเลิก" },
];

export default async function POListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [posResult, canCreate] = await Promise.all([
    getPurchaseOrders({ q: params.q, status: params.status }).catch(() => []),
    hasPermission("po.create"),
  ]);
  const pos = posResult as Awaited<ReturnType<typeof getPurchaseOrders>>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <ShoppingCart className="h-5 w-5 text-nok-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-nok-navy">ใบสั่งซื้อ (PO)</h1>
            <p className="text-muted-foreground text-sm">จัดการใบสั่งซื้อ Purchase Order</p>
          </div>
        </div>
        {canCreate && (
          <Link href="/dashboard/po/new">
            <Button className="bg-nok-blue hover:bg-nok-blue-dark shadow-md">
              <Plus className="mr-2 h-4 w-4" />สร้าง PO
            </Button>
          </Link>
        )}
      </div>

      <ListFilters
        statusOptions={PO_STATUS_OPTIONS}
        placeholder="ค้นหาเลขที่เอกสาร, ชื่อเรื่อง..."
      />

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="nok-table-header hover:bg-transparent">
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ชื่อเรื่อง</TableHead>
              <TableHead>ผู้ขาย</TableHead>
              <TableHead className="text-right">ยอดสุทธิ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-20 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                  ยังไม่มีใบสั่งซื้อ
                </TableCell>
              </TableRow>
            ) : (
              pos.map((po) => (
                <TableRow key={po.id} className="hover:bg-blue-50/50">
                  <TableCell className="font-mono text-sm font-medium text-nok-blue">{po.document_number}</TableCell>
                  <TableCell className="font-medium">{po.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{(po as any).vendors?.name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(po.net_amount)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[po.status || "draft"]}>{STATUS_LABELS[po.status || "draft"]}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/dashboard/po/${po.id}`}>
                      <Button variant="ghost" size="sm" className="text-nok-blue hover:text-nok-blue-dark hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
