import { getUnitsOfMeasure } from "@/lib/actions/document-config";
import { UnitManager } from "@/components/settings/unit-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Ruler } from "lucide-react";

export default async function UnitsPage() {
  const units = await getUnitsOfMeasure();

  return (
    <>
      <SettingsPageHeader icon={Ruler} title="หน่วยนับ" description="จัดการหน่วยนับสินค้าและบริการ" />
      <UnitManager units={units} />
    </>
  );
}
