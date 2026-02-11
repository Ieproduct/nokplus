import { getCompanySettings } from "@/lib/actions/settings";
import { FiscalYearSettings } from "@/components/settings/fiscal-year-settings";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Calendar } from "lucide-react";

export default async function FiscalYearPage() {
  const settings = await getCompanySettings();

  return (
    <>
      <SettingsPageHeader icon={Calendar} title="ปีงบประมาณ" description="ตั้งค่าปีงบประมาณและรูปแบบวันที่" />
      <FiscalYearSettings settings={settings} />
    </>
  );
}
