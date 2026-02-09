"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export function DashboardFilters({ departments }: { departments: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeDept = searchParams.get("department") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const hasFilters = activeDept || dateFrom || dateTo;

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>กรอง:</span>
      </div>

      <select
        value={activeDept}
        onChange={(e) => applyFilter("department", e.target.value)}
        className="rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm focus:border-nok-blue focus:ring-1 focus:ring-nok-blue"
      >
        <option value="">ทุกแผนก</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => applyFilter("dateFrom", e.target.value)}
        placeholder="ตั้งแต่"
        className="rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm focus:border-nok-blue focus:ring-1 focus:ring-nok-blue"
      />

      <span className="text-muted-foreground text-sm">ถึง</span>

      <input
        type="date"
        value={dateTo}
        onChange={(e) => applyFilter("dateTo", e.target.value)}
        placeholder="ถึง"
        className="rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm focus:border-nok-blue focus:ring-1 focus:ring-nok-blue"
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
          <X className="mr-1 h-3.5 w-3.5" />
          ล้าง
        </Button>
      )}
    </div>
  );
}
