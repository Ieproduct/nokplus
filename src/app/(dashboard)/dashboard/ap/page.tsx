import { getApVouchers } from "@/lib/actions/ap";
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import { hasPermission } from "@/lib/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Eye, Receipt } from "lucide-react";
import { ListFilters } from "@/components/list-filters";

const AP_STATUS_OPTIONS = [
  { value: "draft", label: "ร่าง" },
  { value: "pending_approval", label: "รออนุมัติ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "rejected", label: "ปฏิเสธ" },
  { value: "revision", label: "แก้ไข" },
  { value: "cancelled", label: "ยกเลิก" },
  { value: "unpaid", label: "ยังไม่จ่าย" },
  { value: "partial", label: "จ่ายบางส่วน" },
  { value: "paid", label: "จ่ายแล้ว" },
];

export default async function APListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [apsResult, canCreate] = await Promise.all([
    getApVouchers({ q: params.q, status: params.status }).catch(() => []),
    hasPermission("ap.create"),
  ]);
  const aps = apsResult as Awaited<ReturnType<typeof getApVouchers>>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <Receipt className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-nok-navy">ใบสำคัญจ่าย (AP)</h1>
            <p className="text-muted-foreground text-sm">จัดการใบสำคัญจ่าย Accounts Payable</p>
          </div>
        </div>
        {canCreate && (
          <Link href="/dashboard/ap/new">
            <Button className="bg-nok-blue hover:bg-nok-blue-dark shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              สร้าง AP
            </Button>
          </Link>
        )}
      </div>

      <ListFilters
        statusOptions={AP_STATUS_OPTIONS}
        placeholder="ค้นหาเลขที่เอกสาร, ชื่อเรื่อง..."
      />

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="nok-table-header hover:bg-transparent">
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ชื่อเรื่อง</TableHead>
              <TableHead>ผู้ขาย</TableHead>
              <TableHead>เลขที่ใบแจ้งหนี้</TableHead>
              <TableHead className="text-right">ยอดสุทธิ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>การจ่ายเงิน</TableHead>
              <TableHead className="w-20 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                  ยังไม่มีใบสำคัญจ่าย
                </TableCell>
              </TableRow>
            ) : (
              aps.map((ap) => (
                <TableRow key={ap.id} className="hover:bg-blue-50/50">
                  <TableCell className="font-mono text-sm font-medium text-nok-blue">{ap.document_number}</TableCell>
                  <TableCell className="font-medium">{ap.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{(ap as Record<string, unknown> & { vendors?: { name: string } }).vendors?.name || "-"}</TableCell>
                  <TableCell className="text-sm">{ap.invoice_number || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(ap.net_amount)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[ap.status || "draft"]}>
                      {STATUS_LABELS[ap.status || "draft"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[ap.payment_status || "unpaid"]}>
                      {PAYMENT_STATUS_LABELS[ap.payment_status || "unpaid"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/dashboard/ap/${ap.id}`}>
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
