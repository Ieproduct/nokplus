"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

const SETTINGS_PATH = "/dashboard/settings";

// ==================== Vendor Groups ====================

export async function getVendorGroups() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("vendor_groups")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("code");

  if (error) throw error;
  return data;
}

export async function createVendorGroup(input: {
  code: string;
  name: string;
  description?: string;
  default_payment_term?: string;
  default_wht_type?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("vendor_groups").insert({
    company_id: companyId,
    ...input,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสกลุ่มผู้ขายซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateVendorGroup(id: string, input: {
  code: string;
  name: string;
  description?: string;
  default_payment_term?: string;
  default_wht_type?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vendor_groups")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteVendorGroup(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vendor_groups")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== Vendor Document Requirements ====================

export async function getVendorDocumentRequirements() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("vendor_document_requirements")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createVendorDocRequirement(input: {
  code: string;
  name: string;
  description?: string;
  is_required: boolean;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("vendor_document_requirements").insert({
    company_id: companyId,
    ...input,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสเอกสารซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateVendorDocRequirement(id: string, input: {
  code: string;
  name: string;
  description?: string;
  is_required: boolean;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vendor_document_requirements")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteVendorDocRequirement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vendor_document_requirements")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

// ==================== AP Checklist Items ====================

export async function getApChecklistItems() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("ap_checklist_items")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createApChecklistItem(input: {
  code: string;
  name: string;
  is_required: boolean;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("ap_checklist_items").insert({
    company_id: companyId,
    ...input,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัส Checklist ซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateApChecklistItem(id: string, input: {
  code: string;
  name: string;
  is_required: boolean;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ap_checklist_items")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteApChecklistItem(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ap_checklist_items")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}
