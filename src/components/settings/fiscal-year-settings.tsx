"use client";

import { useState } from "react";
import { upsertCompanySetting } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const MONTHS = [
  { value: "1", label: "มกราคม" },
  { value: "2", label: "กุมภาพันธ์" },
  { value: "3", label: "มีนาคม" },
  { value: "4", label: "เมษายน" },
  { value: "5", label: "พฤษภาคม" },
  { value: "6", label: "มิถุนายน" },
  { value: "7", label: "กรกฎาคม" },
  { value: "8", label: "สิงหาคม" },
  { value: "9", label: "กันยายน" },
  { value: "10", label: "ตุลาคม" },
  { value: "11", label: "พฤศจิกายน" },
  { value: "12", label: "ธันวาคม" },
];

interface CompanySetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

function getSettingValue(settings: CompanySetting[], key: string, fallback: string): string {
  const found = settings.find((s) => s.key === key);
  return found?.value ?? fallback;
}

export function FiscalYearSettings({ settings }: { settings: CompanySetting[] }) {
  const [fiscalYearStart, setFiscalYearStart] = useState(
    getSettingValue(settings, "fiscal_year_start", "1")
  );
  const [buddhistEra, setBuddhistEra] = useState(
    getSettingValue(settings, "buddhist_era", "true") === "true"
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await upsertCompanySetting(
        "fiscal_year_start",
        fiscalYearStart,
        "เดือนเริ่มต้นปีงบประมาณ (1-12)"
      );
      await upsertCompanySetting(
        "buddhist_era",
        buddhistEra.toString(),
        "ใช้ พ.ศ. ในเลขที่เอกสาร"
      );
      toast.success("บันทึกการตั้งค่าปีงบประมาณเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ตั้งค่าปีงบประมาณ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>เดือนเริ่มต้นปีงบประมาณ</Label>
          <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกเดือน" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            ปีงบประมาณจะเริ่มต้นในเดือนที่เลือก
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="buddhist_era"
            checked={buddhistEra}
            onCheckedChange={(checked) => setBuddhistEra(checked === true)}
          />
          <Label htmlFor="buddhist_era" className="cursor-pointer">
            ใช้ปี พ.ศ. ในเลขที่เอกสาร
          </Label>
        </div>
        <p className="text-sm text-muted-foreground -mt-4">
          เช่น PR-2569-0001 แทน PR-2026-0001
        </p>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
