import { getApVouchers } from "@/lib/actions/ap";
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
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
  let aps: Awaited<ReturnType<typeof getApVouchers>> = [];
  try {
    aps = await getApVouchers({
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
          <h1 className="text-2xl font-bold">ใบสำคัญจ่าย (AP)</h1>
          <p className="text-muted-foreground">จัดการใบสำคัญจ่าย Accounts Payable</p>
        </div>
        <Link href="/dashboard/ap/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            สร้าง AP
          </Button>
        </Link>
      </div>

      <ListFilters
        statusOptions={AP_STATUS_OPTIONS}
        placeholder="ค้นหาเลขที่เอกสาร, ชื่อเรื่อง..."
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ชื่อเรื่อง</TableHead>
              <TableHead>ผู้ขาย</TableHead>
              <TableHead>เลขที่ใบแจ้งหนี้</TableHead>
              <TableHead className="text-right">ยอดสุทธิ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>การจ่ายเงิน</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีใบสำคัญจ่าย
                </TableCell>
              </TableRow>
            ) : (
              aps.map((ap) => (
                <TableRow key={ap.id}>
                  <TableCell className="font-mono text-sm">{ap.document_number}</TableCell>
                  <TableCell className="font-medium">{ap.title}</TableCell>
                  <TableCell>{(ap as Record<string, unknown> & { vendors?: { name: string } }).vendors?.name || "-"}</TableCell>
                  <TableCell className="text-sm">{ap.invoice_number || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ap.net_amount)}</TableCell>
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
                  <TableCell>
                    <Link href={`/dashboard/ap/${ap.id}`}>
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
