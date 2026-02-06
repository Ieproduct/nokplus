import { getPurchaseRequisitions } from "@/lib/actions/pr";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateThai } from "@/lib/utils/date";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { ListFilters } from "@/components/list-filters";

const PR_STATUS_OPTIONS = [
  { value: "draft", label: "ร่าง" },
  { value: "pending_approval", label: "รออนุมัติ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "rejected", label: "ปฏิเสธ" },
  { value: "revision", label: "แก้ไข" },
  { value: "cancelled", label: "ยกเลิก" },
];

export default async function PRListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  let prs: Awaited<ReturnType<typeof getPurchaseRequisitions>> = [];
  try {
    prs = await getPurchaseRequisitions({
      q: params.q,
      status: params.status,
    });
  } catch {
    // empty
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ใบขอซื้อ (PR)</h1>
          <p className="text-muted-foreground">จัดการใบขอซื้อ Purchase Requisition</p>
        </div>
        <Link href="/dashboard/pr/new">
          <Button><Plus className="mr-2 h-4 w-4" />สร้าง PR</Button>
        </Link>
      </div>

      <ListFilters
        statusOptions={PR_STATUS_OPTIONS}
        placeholder="ค้นหาเลขที่เอกสาร, ชื่อเรื่อง..."
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ชื่อเรื่อง</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>ผู้ขอ</TableHead>
              <TableHead className="text-right">ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีใบขอซื้อ
                </TableCell>
              </TableRow>
            ) : (
              prs.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-mono text-sm">{pr.document_number}</TableCell>
                  <TableCell className="font-medium">{pr.title}</TableCell>
                  <TableCell>{pr.department}</TableCell>
                  <TableCell>{(pr as any).profiles?.full_name || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(pr.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[pr.status || "draft"]}>
                      {STATUS_LABELS[pr.status || "draft"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/pr/${pr.id}`}>
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
