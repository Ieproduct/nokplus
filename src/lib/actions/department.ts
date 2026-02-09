"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId, getCompanyIdOrActive } from "@/lib/company-context";

// ==================== Departments ====================

export async function getDepartments(forCompanyId?: string) {
  const supabase = await createClient();
  const companyId = await getCompanyIdOrActive(forCompanyId);

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("code");

  if (error) throw error;
  return data;
}

export async function getAllDepartments() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("company_id", companyId)
    .order("code");

  if (error) throw error;
  return data;
}

export async function createDepartment(input: {
  code: string;
  name: string;
  name_en?: string;
  default_cost_center?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("departments").insert({
    company_id: companyId,
    code: input.code,
    name: input.name,
    name_en: input.name_en || null,
    default_cost_center: input.default_cost_center || null,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสแผนกซ้ำ");
    throw error;
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateDepartment(
  id: string,
  input: { code: string; name: string; name_en?: string; default_cost_center?: string; is_active?: boolean }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("departments")
    .update({
      code: input.code,
      name: input.name,
      name_en: input.name_en || null,
      default_cost_center: input.default_cost_center || null,
      is_active: input.is_active ?? true,
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteDepartment(id: string) {
  const supabase = await createClient();

  // Soft delete (set is_active = false)
  const { error } = await supabase
    .from("departments")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

// ==================== Cost Centers ====================

export async function getCostCenters(forCompanyId?: string) {
  const supabase = await createClient();
  const companyId = await getCompanyIdOrActive(forCompanyId);

  const { data, error } = await supabase
    .from("cost_centers")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("code");

  if (error) throw error;
  return data;
}

export async function getAllCostCenters() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("cost_centers")
    .select("*")
    .eq("company_id", companyId)
    .order("code");

  if (error) throw error;
  return data;
}

export async function createCostCenter(input: {
  code: string;
  name: string;
  name_en?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("cost_centers").insert({
    company_id: companyId,
    code: input.code,
    name: input.name,
    name_en: input.name_en || null,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัส Cost Center ซ้ำ");
    throw error;
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateCostCenter(
  id: string,
  input: { code: string; name: string; name_en?: string; is_active?: boolean }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cost_centers")
    .update({
      code: input.code,
      name: input.name,
      name_en: input.name_en || null,
      is_active: input.is_active ?? true,
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteCostCenter(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cost_centers")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}
