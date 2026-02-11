"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

const SETTINGS_PATH = "/dashboard/settings";

export async function getNotificationSettings() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("company_id", companyId)
    .order("event_type");

  if (error) throw error;
  return data;
}

export async function updateNotificationSetting(id: string, input: {
  is_enabled: boolean;
  recipients?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notification_settings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}
