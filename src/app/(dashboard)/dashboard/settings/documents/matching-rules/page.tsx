import { getMatchingRules } from "@/lib/actions/document-config";
import { MatchingRuleManager } from "@/components/settings/matching-rule-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { GitCompareArrows } from "lucide-react";

export default async function MatchingRulesPage() {
  const rules = await getMatchingRules();

  return (
    <>
      <SettingsPageHeader icon={GitCompareArrows} title="กฎการจับคู่" description="ตั้งค่า Three-Way Match (PO/ใบรับของ/ใบแจ้งหนี้)" />
      <MatchingRuleManager rules={rules} />
    </>
  );
}
