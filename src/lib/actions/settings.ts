"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

const SETTINGS_PATH = "/dashboard/settings";

// ==================== Company Settings (key-value) ====================

export async function getCompanySettings() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", companyId)
    .order("key");

  if (error) throw error;
  return data;
}

export async function getCompanySetting(key: string) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", companyId)
    .eq("key", key)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertCompanySetting(key: string, value: string, description?: string) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("company_settings")
    .upsert(
      { company_id: companyId, key, value, description, updated_at: new Date().toISOString() },
      { onConflict: "company_id,key" }
    );

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}
