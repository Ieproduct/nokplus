import { getPurchaseRequisitions } from "@/lib/actions/pr";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";
import { hasPermission } from "@/lib/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Eye, FileText } from "lucide-react";
import { ListFilters } from "@/components/list-filters";
import { CompanyFilterToggle } from "@/components/company-filter-toggle";

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
  searchParams: Promise<{ q?: string; status?: string; all?: string }>;
}) {
  const params = await searchParams;
  const allCompanies = params.all === "1";
  const [prsResult, canCreate] = await Promise.all([
    getPurchaseRequisitions({ q: params.q, status: params.status, allCompanies }).catch(() => []),
    hasPermission("pr.create"),
  ]);
  const prs = prsResult as Awaited<ReturnType<typeof getPurchaseRequisitions>>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nok-blue/10">
            <FileText className="h-5 w-5 text-nok-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-nok-navy">ใบขอซื้อ (PR)</h1>
            <p className="text-muted-foreground text-sm">จัดการใบขอซื้อ Purchase Requisition</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CompanyFilterToggle />
          {canCreate && (
            <Link href="/dashboard/pr/new">
              <Button className="bg-nok-blue hover:bg-nok-blue-dark shadow-md">
                <Plus className="mr-2 h-4 w-4" />สร้าง PR
              </Button>
            </Link>
          )}
        </div>
      </div>

      <ListFilters
        statusOptions={PR_STATUS_OPTIONS}
        placeholder="ค้นหาเลขที่เอกสาร, ชื่อเรื่อง..."
      />

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="nok-table-header hover:bg-transparent">
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ชื่อเรื่อง</TableHead>
              {allCompanies && <TableHead>บริษัท</TableHead>}
              <TableHead>แผนก</TableHead>
              <TableHead>ผู้ขอ</TableHead>
              <TableHead className="text-right">ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-20 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allCompanies ? 8 : 7} className="text-center py-12 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                  ยังไม่มีใบขอซื้อ
                </TableCell>
              </TableRow>
            ) : (
              prs.map((pr) => (
                <TableRow key={pr.id} className="hover:bg-blue-50/50">
                  <TableCell className="font-mono text-sm font-medium text-nok-blue">{pr.document_number}</TableCell>
                  <TableCell className="font-medium">{pr.title}</TableCell>
                  {allCompanies && (
                    <TableCell className="text-sm text-muted-foreground">
                      {(pr as any).companies?.name_th || "-"}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground">{pr.department}</TableCell>
                  <TableCell className="text-sm">{(pr as any).profiles?.full_name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(pr.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[pr.status || "draft"]}>
                      {STATUS_LABELS[pr.status || "draft"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/dashboard/pr/${pr.id}`}>
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
