"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

const SETTINGS_PATH = "/dashboard/settings";

export async function getPurchasingOrganizations() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("purchasing_organizations")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("code");

  if (error) throw error;
  return data;
}

export async function createPurchasingOrganization(input: {
  code: string;
  name: string;
  name_en?: string;
  parent_id?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("purchasing_organizations").insert({
    company_id: companyId,
    code: input.code,
    name: input.name,
    name_en: input.name_en || null,
    parent_id: input.parent_id || null,
  });

  if (error) {
    if (error.code === "23505") throw new Error("รหัสหน่วยจัดซื้อซ้ำ");
    throw error;
  }

  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updatePurchasingOrganization(id: string, input: {
  code: string;
  name: string;
  name_en?: string;
  parent_id?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("purchasing_organizations")
    .update({
      code: input.code,
      name: input.name,
      name_en: input.name_en || null,
      parent_id: input.parent_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deletePurchasingOrganization(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("purchasing_organizations")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}
