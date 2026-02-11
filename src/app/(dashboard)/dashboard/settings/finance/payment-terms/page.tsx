import { getPaymentTerms } from "@/lib/actions/finance";
import { PaymentTermManager } from "@/components/settings/payment-term-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { CreditCard } from "lucide-react";

export default async function PaymentTermsPage() {
  const terms = await getPaymentTerms();

  return (
    <>
      <SettingsPageHeader icon={CreditCard} title="เงื่อนไขชำระ" description="จัดการเงื่อนไขการชำระเงิน" />
      <PaymentTermManager terms={terms} />
    </>
  );
}
