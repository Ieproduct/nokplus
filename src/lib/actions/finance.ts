"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

const SETTINGS_PATH = "/dashboard/settings";

// ==================== Payment Terms ====================

export async function getPaymentTerms() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("payment_terms")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createPaymentTerm(input: {
  code: string;
  name: string;
  days: number;
  discount_percent?: number;
  description?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("payment_terms").insert({
    company_id: companyId,
    ...input,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสเงื่อนไขชำระซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updatePaymentTerm(id: string, input: {
  code: string;
  name: string;
  days: number;
  discount_percent?: number;
  description?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_terms")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deletePaymentTerm(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_terms")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Tax Configurations ====================

export async function getTaxConfigurations() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("tax_configurations")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function updateTaxConfiguration(id: string, input: {
  label: string;
  rate: number;
  description?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tax_configurations")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function createTaxConfiguration(input: {
  tax_type: string;
  code: string;
  label: string;
  rate: number;
  description?: string;
  calculation_base?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("tax_configurations").insert({
    company_id: companyId,
    ...input,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสภาษีซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteTaxConfiguration(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tax_configurations")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Currencies ====================

export async function getCurrencies() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("currencies")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("is_base", { ascending: false })
    .order("code");

  if (error) throw error;
  return data;
}

export async function createCurrency(input: {
  code: string;
  name: string;
  symbol?: string;
  exchange_rate: number;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("currencies").insert({
    company_id: companyId,
    ...input,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสสกุลเงินซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateCurrency(id: string, input: {
  code: string;
  name: string;
  symbol?: string;
  exchange_rate: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("currencies")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteCurrency(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("currencies")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Tolerance Groups ====================

export async function getToleranceGroups() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("tolerance_groups")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (error) throw error;
  return data;
}

export async function createToleranceGroup(input: {
  name: string;
  description?: string;
  price_variance_percent: number;
  quantity_variance_percent: number;
  amount_tolerance: number;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("tolerance_groups").insert({
    company_id: companyId,
    ...input,
  });

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateToleranceGroup(id: string, input: {
  name: string;
  description?: string;
  price_variance_percent: number;
  quantity_variance_percent: number;
  amount_tolerance: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tolerance_groups")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteToleranceGroup(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tolerance_groups")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Budget Controls ====================

export async function getBudgetControls(fiscalYear?: number) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();
  const year = fiscalYear || new Date().getFullYear() + 543; // Buddhist year

  let query = supabase
    .from("budget_controls")
    .select("*, departments(name), cost_centers(name)")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (fiscalYear) {
    query = query.eq("fiscal_year", year);
  }

  const { data, error } = await query.order("fiscal_year", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createBudgetControl(input: {
  fiscal_year: number;
  department_id?: string;
  cost_center_id?: string;
  budget_amount: number;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("budget_controls").insert({
    company_id: companyId,
    ...input,
  });

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateBudgetControl(id: string, input: {
  budget_amount: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("budget_controls")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteBudgetControl(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("budget_controls")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}
