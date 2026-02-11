import { getGoodsReceipts } from "@/lib/actions/gr";
import { hasPermission } from "@/lib/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Eye, PackageCheck } from "lucide-react";
import { ListFilters } from "@/components/list-filters";
import { CompanyFilterToggle } from "@/components/company-filter-toggle";

const GR_STATUS_OPTIONS = [
  { value: "draft", label: "ร่าง" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

const GR_STATUS_LABELS: Record<string, string> = {
  draft: "ร่าง",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิก",
};

const GR_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function GRListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; all?: string }>;
}) {
  const params = await searchParams;
  const allCompanies = params.all === "1";
  const [grsResult, canCreate] = await Promise.all([
    getGoodsReceipts({ q: params.q, status: params.status, allCompanies }).catch(() => []),
    hasPermission("gr.create"),
  ]);
  const grs = grsResult as Awaited<ReturnType<typeof getGoodsReceipts>>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nok-blue/10">
            <PackageCheck className="h-5 w-5 text-nok-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-nok-navy">ใบรับสินค้า (GR)</h1>
            <p className="text-muted-foreground text-sm">จัดการใบรับสินค้า Goods Receipt</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CompanyFilterToggle />
          {canCreate && (
            <Link href="/dashboard/gr/new">
              <Button className="bg-nok-blue hover:bg-nok-blue-dark shadow-md">
                <Plus className="mr-2 h-4 w-4" />สร้าง GR
              </Button>
            </Link>
          )}
        </div>
      </div>

      <ListFilters
        statusOptions={GR_STATUS_OPTIONS}
        placeholder="ค้นหาเลขที่เอกสาร..."
      />

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="nok-table-header hover:bg-transparent">
              <TableHead>เลขที่ GR</TableHead>
              <TableHead>เลขที่ PO</TableHead>
              <TableHead>ผู้ขาย</TableHead>
              {allCompanies && <TableHead>บริษัท</TableHead>}
              <TableHead>วันที่รับ</TableHead>
              <TableHead>ผู้รับ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-20 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allCompanies ? 8 : 7} className="text-center py-12 text-muted-foreground">
                  <PackageCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                  ยังไม่มีใบรับสินค้า
                </TableCell>
              </TableRow>
            ) : (
              grs.map((gr) => (
                <TableRow key={gr.id} className="hover:bg-blue-50/50">
                  <TableCell className="font-mono text-sm font-medium text-nok-blue">{gr.document_number}</TableCell>
                  <TableCell className="text-sm">{(gr as any).purchase_orders?.document_number || "-"}</TableCell>
                  <TableCell className="text-sm">{(gr as any).purchase_orders?.vendors?.name || "-"}</TableCell>
                  {allCompanies && (
                    <TableCell className="text-sm text-muted-foreground">
                      {(gr as any).companies?.name_th || "-"}
                    </TableCell>
                  )}
                  <TableCell className="text-sm">{gr.receipt_date}</TableCell>
                  <TableCell className="text-sm">{(gr as any).profiles?.full_name || "-"}</TableCell>
                  <TableCell>
                    <Badge className={GR_STATUS_COLORS[gr.status] || "bg-gray-100 text-gray-700"}>
                      {GR_STATUS_LABELS[gr.status] || gr.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/dashboard/gr/${gr.id}`}>
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
