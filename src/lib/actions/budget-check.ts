"use server";

import { createClient } from "@/lib/supabase/server";
import { getCompanyIdOrActive } from "@/lib/company-context";

export async function checkBudgetAvailability(
  companyId: string | undefined,
  department: string,
  costCenter: string | undefined,
  amount: number
) {
  const supabase = await createClient();
  const cid = await getCompanyIdOrActive(companyId);

  // Get current fiscal year (Buddhist year)
  const currentYear = new Date().getFullYear() + 543;

  // Find matching budget control
  let query = supabase
    .from("budget_controls")
    .select("*")
    .eq("company_id", cid)
    .eq("fiscal_year", currentYear)
    .eq("is_active", true);

  // Match by department (via departments table code lookup)
  const { data: dept } = await supabase
    .from("departments")
    .select("id")
    .eq("company_id", cid)
    .eq("code", department)
    .single();

  if (dept) {
    query = query.eq("department_id", dept.id);
  }

  if (costCenter) {
    const { data: cc } = await supabase
      .from("cost_centers")
      .select("id")
      .eq("company_id", cid)
      .eq("code", costCenter)
      .single();

    if (cc) {
      query = query.eq("cost_center_id", cc.id);
    }
  }

  const { data: budgets, error } = await query.limit(1);

  if (error || !budgets || budgets.length === 0) {
    // No budget control found — allow (budget control is optional)
    return { available: true, remaining: null, budgetId: null, noBudget: true };
  }

  const budget = budgets[0];
  const remaining = budget.budget_amount - budget.used_amount - budget.reserved_amount;

  return {
    available: remaining >= amount,
    remaining,
    budgetId: budget.id,
    budgetAmount: budget.budget_amount,
    usedAmount: budget.used_amount,
    reservedAmount: budget.reserved_amount,
    noBudget: false,
  };
}

export async function reserveBudget(budgetId: string, amount: number) {
  const supabase = await createClient();

  const { data: budget, error: fetchError } = await supabase
    .from("budget_controls")
    .select("reserved_amount")
    .eq("id", budgetId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("budget_controls")
    .update({
      reserved_amount: (budget.reserved_amount || 0) + amount,
    })
    .eq("id", budgetId);

  if (error) throw error;
  return { success: true };
}

export async function releaseBudget(budgetId: string, amount: number) {
  const supabase = await createClient();

  const { data: budget, error: fetchError } = await supabase
    .from("budget_controls")
    .select("reserved_amount")
    .eq("id", budgetId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("budget_controls")
    .update({
      reserved_amount: Math.max(0, (budget.reserved_amount || 0) - amount),
    })
    .eq("id", budgetId);

  if (error) throw error;
  return { success: true };
}

export async function commitBudget(budgetId: string, amount: number) {
  const supabase = await createClient();

  const { data: budget, error: fetchError } = await supabase
    .from("budget_controls")
    .select("reserved_amount, used_amount")
    .eq("id", budgetId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("budget_controls")
    .update({
      reserved_amount: Math.max(0, (budget.reserved_amount || 0) - amount),
      used_amount: (budget.used_amount || 0) + amount,
    })
    .eq("id", budgetId);

  if (error) throw error;
  return { success: true };
}
