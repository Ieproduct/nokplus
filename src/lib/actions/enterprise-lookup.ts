"use server";

import { createClient } from "@/lib/supabase/server";
import { getCompanyIdOrActive } from "@/lib/company-context";

export async function getActiveUnits(companyId?: string) {
  const supabase = await createClient();
  const cid = await getCompanyIdOrActive(companyId);
  const { data, error } = await supabase
    .from("units_of_measure")
    .select("code, name")
    .eq("company_id", cid)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActivePaymentTerms(companyId?: string) {
  const supabase = await createClient();
  const cid = await getCompanyIdOrActive(companyId);
  const { data, error } = await supabase
    .from("payment_terms")
    .select("code, name, days")
    .eq("company_id", cid)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveTaxRates(companyId?: string) {
  const supabase = await createClient();
  const cid = await getCompanyIdOrActive(companyId);
  const { data, error } = await supabase
    .from("tax_configurations")
    .select("id, code, label, tax_type, rate, calculation_base")
    .eq("company_id", cid)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveCurrencies(companyId?: string) {
  const supabase = await createClient();
  const cid = await getCompanyIdOrActive(companyId);
  const { data, error } = await supabase
    .from("currencies")
    .select("code, name, symbol, exchange_rate, is_base")
    .eq("company_id", cid)
    .eq("is_active", true)
    .order("is_base", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getActivePurchasingOrgs(companyId?: string) {
  const supabase = await createClient();
  const cid = await getCompanyIdOrActive(companyId);
  const { data, error } = await supabase
    .from("purchasing_organizations")
    .select("id, code, name")
    .eq("company_id", cid)
    .eq("is_active", true)
    .order("code", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getVendorDefaults(vendorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("payment_term, vendor_group_id, vendor_groups(default_payment_term, default_wht_type)")
    .eq("id", vendorId)
    .single();

  if (error) throw error;

  const vendorGroup = data.vendor_groups as { default_payment_term: string | null; default_wht_type: string | null } | null;
  return {
    payment_term: data.payment_term || vendorGroup?.default_payment_term || null,
    wht_type: vendorGroup?.default_wht_type || null,
  };
}

export async function getPRWithLineItems(prId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_requisitions")
    .select("id, title, department, cost_center, description, pr_line_items(id, description, quantity, unit, unit_price, material_code, delivery_date)")
    .eq("id", prId)
    .single();

  if (error) throw error;
  return data;
}

export async function getFieldControls(documentType: string, companyId?: string) {
  const supabase = await createClient();
  const cid = await getCompanyIdOrActive(companyId);
  const { data, error } = await supabase
    .from("field_controls")
    .select("field_name, field_label, is_visible, is_required, is_editable, default_value")
    .eq("company_id", cid)
    .eq("document_type", documentType)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
