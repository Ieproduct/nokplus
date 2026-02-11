import { getBudgetControls } from "@/lib/actions/finance";
import { getAllDepartments, getAllCostCenters } from "@/lib/actions/department";
import { BudgetManager } from "@/components/settings/budget-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { PiggyBank } from "lucide-react";

export default async function BudgetPage() {
  const [budgets, departments, costCenters] = await Promise.all([
    getBudgetControls(),
    getAllDepartments(),
    getAllCostCenters(),
  ]);

  return (
    <>
      <SettingsPageHeader icon={PiggyBank} title="งบประมาณ" description="จัดการงบประมาณตามแผนกและ Cost Center" />
      <BudgetManager budgets={budgets as any} departments={departments} costCenters={costCenters} />
    </>
  );
}
