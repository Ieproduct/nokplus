"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { switchCompany, createCompany } from "@/lib/actions/company";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
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
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleSwitch(companyId: string) {
    if (companyId === "__new__") {
      setCreateOpen(true);
      return;
    }
    if (companyId === activeCompanyId) return;
    try {
      await switchCompany(companyId);
      router.refresh();
      toast.success("เปลี่ยนบริษัทเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    try {
      const form = new FormData(e.currentTarget);
      await createCompany({
        name_th: form.get("name_th") as string,
        name_en: (form.get("name_en") as string) || undefined,
        tax_id: (form.get("tax_id") as string) || undefined,
      });
      setCreateOpen(false);
      router.refresh();
      toast.success("สร้างบริษัทใหม่เรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
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
          <SelectItem value="__new__" className="text-blue-600 font-medium">
            <span className="flex items-center gap-1">
              <Plus className="h-3 w-3" /> สร้างบริษัทใหม่
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างบริษัทใหม่</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="new_name_th">ชื่อบริษัท (TH) *</Label>
              <Input id="new_name_th" name="name_th" required placeholder="บริษัท ..." />
            </div>
            <div>
              <Label htmlFor="new_name_en">ชื่อบริษัท (EN)</Label>
              <Input id="new_name_en" name="name_en" placeholder="Company ..." />
            </div>
            <div>
              <Label htmlFor="new_tax_id">เลขประจำตัวผู้เสียภาษี</Label>
              <Input id="new_tax_id" name="tax_id" placeholder="0-0000-00000-00-0" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "กำลังสร้าง..." : "สร้างบริษัท"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
