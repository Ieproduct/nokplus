import { getCurrencies } from "@/lib/actions/finance";
import { CurrencyManager } from "@/components/settings/currency-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Banknote } from "lucide-react";

export default async function CurrencyPage() {
  const currencies = await getCurrencies();

  return (
    <>
      <SettingsPageHeader icon={Banknote} title="สกุลเงิน" description="จัดการสกุลเงินและอัตราแลกเปลี่ยน" />
      <CurrencyManager currencies={currencies} />
    </>
  );
}
