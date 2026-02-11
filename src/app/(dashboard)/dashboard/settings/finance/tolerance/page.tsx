import { getToleranceGroups } from "@/lib/actions/finance";
import { ToleranceManager } from "@/components/settings/tolerance-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Gauge } from "lucide-react";

export default async function TolerancePage() {
  const groups = await getToleranceGroups();

  return (
    <>
      <SettingsPageHeader icon={Gauge} title="ค่าความคลาดเคลื่อน" description="กำหนดเกณฑ์ความคลาดเคลื่อนราคาและจำนวน" />
      <ToleranceManager groups={groups} />
    </>
  );
}
