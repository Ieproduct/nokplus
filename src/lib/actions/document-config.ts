"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

const SETTINGS_PATH = "/dashboard/settings";

// ==================== Document Number Ranges ====================

export async function getDocumentNumberRanges() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("document_number_ranges")
    .select("*")
    .eq("company_id", companyId)
    .order("document_type");

  if (error) throw error;
  return data;
}

export async function updateDocumentNumberRange(
  id: string,
  input: { prefix: string; format: string; next_number?: number; description?: string }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("document_number_ranges")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Units of Measure ====================

export async function getUnitsOfMeasure() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("units_of_measure")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createUnit(input: { code: string; name: string; name_en?: string }) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("units_of_measure").insert({
    company_id: companyId,
    code: input.code,
    name: input.name,
    name_en: input.name_en || null,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสหน่วยนับซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateUnit(id: string, input: { code: string; name: string; name_en?: string }) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("units_of_measure")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteUnit(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("units_of_measure")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Field Controls ====================

export async function getFieldControls(documentType?: string) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  let query = supabase
    .from("field_controls")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order");

  if (documentType) {
    query = query.eq("document_type", documentType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertFieldControl(input: {
  document_type: string;
  field_name: string;
  field_label: string;
  is_required: boolean;
  is_visible: boolean;
  is_editable: boolean;
  default_value?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("field_controls")
    .upsert(
      { company_id: companyId, ...input, updated_at: new Date().toISOString() },
      { onConflict: "company_id,document_type,field_name" }
    );

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Matching Rules ====================

export async function getMatchingRules() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("matching_rules")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (error) throw error;
  return data;
}

export async function createMatchingRule(input: {
  name: string;
  description?: string;
  match_po: boolean;
  match_gr: boolean;
  match_invoice: boolean;
  price_tolerance_percent: number;
  quantity_tolerance_percent: number;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("matching_rules").insert({
    company_id: companyId,
    ...input,
  });

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateMatchingRule(id: string, input: {
  name: string;
  description?: string;
  match_po: boolean;
  match_gr: boolean;
  match_invoice: boolean;
  price_tolerance_percent: number;
  quantity_tolerance_percent: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matching_rules")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteMatchingRule(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matching_rules")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}
