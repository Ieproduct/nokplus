import { getPurchaseOrders } from "@/lib/actions/po";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
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
  let pos: Awaited<ReturnType<typeof getPurchaseOrders>> = [];
  try {
    pos = await getPurchaseOrders({
      q: params.q,
      status: params.status,
    });
  } catch { /* empty */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ใบสั่งซื้อ (PO)</h1>
          <p className="text-muted-foreground">จัดการใบสั่งซื้อ Purchase Order</p>
        </div>
        <Link href="/dashboard/po/new">
          <Button><Plus className="mr-2 h-4 w-4" />สร้าง PO</Button>
        </Link>
      </div>

      <ListFilters
        statusOptions={PO_STATUS_OPTIONS}
        placeholder="ค้นหาเลขที่เอกสาร, ชื่อเรื่อง..."
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ชื่อเรื่อง</TableHead>
              <TableHead>ผู้ขาย</TableHead>
              <TableHead className="text-right">ยอดสุทธิ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">ยังไม่มีใบสั่งซื้อ</TableCell>
              </TableRow>
            ) : (
              pos.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-sm">{po.document_number}</TableCell>
                  <TableCell className="font-medium">{po.title}</TableCell>
                  <TableCell>{(po as any).vendors?.name || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(po.net_amount)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[po.status || "draft"]}>{STATUS_LABELS[po.status || "draft"]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/po/${po.id}`}>
                      <Button variant="ghost" size="sm">ดู</Button>
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
