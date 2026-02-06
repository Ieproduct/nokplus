import { getVendors } from "@/lib/actions/vendor";
import { VENDOR_STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
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
import { Plus, Check, X } from "lucide-react";
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
  let vendors: Awaited<ReturnType<typeof getVendors>> = [];
  try {
    vendors = await getVendors({
      q: params.q,
      status: params.status,
    });
  } catch {
    // Will show empty state
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ผู้ขาย</h1>
          <p className="text-muted-foreground">จัดการข้อมูลผู้ขาย/ผู้ให้บริการ</p>
        </div>
        <Link href="/dashboard/vendors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มผู้ขาย
          </Button>
        </Link>
      </div>

      <ListFilters
        statusOptions={VENDOR_STATUS_OPTIONS}
        placeholder="ค้นหารหัส, ชื่อผู้ขาย..."
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">รหัส</TableHead>
              <TableHead>ชื่อผู้ขาย</TableHead>
              <TableHead>เลขประจำตัวผู้เสียภาษี</TableHead>
              <TableHead>ผู้ติดต่อ</TableHead>
              <TableHead>เอกสาร</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีข้อมูลผู้ขาย
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-mono text-sm">{vendor.code}</TableCell>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell className="text-sm">{vendor.tax_id || "-"}</TableCell>
                  <TableCell className="text-sm">{vendor.contact_person || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {vendor.has_pp20 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                      {vendor.has_company_cert ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                      {vendor.has_bank_account_copy ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[vendor.status || "pending"]}>
                      {VENDOR_STATUS_LABELS[vendor.status || "pending"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/vendors/${vendor.id}`}>
                      <Button variant="ghost" size="sm">แก้ไข</Button>
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
