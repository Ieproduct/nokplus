import { getVendors } from "@/lib/actions/vendor";
import { VENDOR_STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Check, X, Eye, Users } from "lucide-react";
import { ListFilters } from "@/components/list-filters";

const VENDOR_STATUS_OPTIONS = [
  { value: "pending", label: "รอตรวจสอบ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "suspended", label: "ระงับชั่วคราว" },
  { value: "blacklisted", label: "ขึ้นบัญชีดำ" },
];

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [vendorsResult, canCreate] = await Promise.all([
    getVendors({ q: params.q, status: params.status }).catch(() => []),
    hasPermission("vendor.create"),
  ]);
  const vendors = vendorsResult as Awaited<ReturnType<typeof getVendors>>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-nok-navy">ผู้ขาย</h1>
            <p className="text-muted-foreground text-sm">จัดการข้อมูลผู้ขาย/ผู้ให้บริการ</p>
          </div>
        </div>
        {canCreate && (
          <Link href="/dashboard/vendors/new">
            <Button className="bg-nok-blue hover:bg-nok-blue-dark shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มผู้ขาย
            </Button>
          </Link>
        )}
      </div>

      <ListFilters
        statusOptions={VENDOR_STATUS_OPTIONS}
        placeholder="ค้นหารหัส, ชื่อผู้ขาย..."
      />

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="nok-table-header hover:bg-transparent">
              <TableHead className="w-24">รหัส</TableHead>
              <TableHead>ชื่อผู้ขาย</TableHead>
              <TableHead>เลขประจำตัวผู้เสียภาษี</TableHead>
              <TableHead>ผู้ติดต่อ</TableHead>
              <TableHead>เอกสาร</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-20 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                  ยังไม่มีข้อมูลผู้ขาย
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-blue-50/50">
                  <TableCell className="font-mono text-sm font-medium text-nok-blue">{vendor.code}</TableCell>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{vendor.tax_id || "-"}</TableCell>
                  <TableCell className="text-sm">{vendor.contact_person || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <span title="ภพ.20">
                        {vendor.has_pp20 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
                            <X className="h-3.5 w-3.5 text-red-400" />
                          </span>
                        )}
                      </span>
                      <span title="หนังสือรับรอง">
                        {vendor.has_company_cert ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
                            <X className="h-3.5 w-3.5 text-red-400" />
                          </span>
                        )}
                      </span>
                      <span title="สำเนาบัญชี">
                        {vendor.has_bank_account_copy ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
                            <X className="h-3.5 w-3.5 text-red-400" />
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[vendor.status || "pending"]}>
                      {VENDOR_STATUS_LABELS[vendor.status || "pending"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/dashboard/vendors/${vendor.id}`}>
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
