"use client";

import { useRouter } from "next/navigation";
import { switchCompany } from "@/lib/actions/company";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Company {
  company_id: string;
  role: string;
  companies: {
    id: string;
    name_th: string;
    name_en: string | null;
    logo_url: string | null;
  } | null;
}

export function CompanySwitcher({
  companies,
  activeCompanyId,
}: {
  companies: Company[];
  activeCompanyId: string;
}) {
  const router = useRouter();

  async function handleSwitch(companyId: string) {
    if (companyId === activeCompanyId) return;
    try {
      await switchCompany(companyId);
      router.refresh();
      toast.success("เปลี่ยนบริษัทเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  if (companies.length <= 1) {
    const name = companies[0]?.companies?.name_th || "ไม่มีบริษัท";
    return (
      <span className="text-sm font-medium truncate max-w-[180px]">
        {name}
      </span>
    );
  }

  return (
    <Select value={activeCompanyId} onValueChange={handleSwitch}>
      <SelectTrigger className="w-[200px] h-8 text-sm">
        <SelectValue placeholder="เลือกบริษัท" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((c) => (
          <SelectItem key={c.company_id} value={c.company_id}>
            {c.companies?.name_th || "ไม่มีชื่อ"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
