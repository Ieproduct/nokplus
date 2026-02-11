import { getTaxConfigurations } from "@/lib/actions/finance";
import { TaxConfigManager } from "@/components/settings/tax-config-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Receipt } from "lucide-react";

export default async function TaxPage() {
  const configs = await getTaxConfigurations();

  return (
    <>
      <SettingsPageHeader icon={Receipt} title="ภาษี" description="จัดการอัตราภาษีมูลค่าเพิ่มและภาษีหัก ณ ที่จ่าย" />
      <TaxConfigManager configs={configs} />
    </>
  );
}
