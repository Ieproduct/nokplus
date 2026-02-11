"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

const SETTINGS_PATH = "/dashboard/settings";

export async function getApprovalDelegations() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("approval_delegations")
    .select(`
      *,
      delegator:delegator_id(id, user_id, role, profiles:user_id(full_name, email)),
      delegate:delegate_id(id, user_id, role, profiles:user_id(full_name, email))
    `)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createApprovalDelegation(input: {
  delegator_id: string;
  delegate_id: string;
  start_date: string;
  end_date: string;
  max_amount?: number;
  document_types?: string[];
  reason?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("approval_delegations").insert({
    company_id: companyId,
    ...input,
  });

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function updateApprovalDelegation(id: string, input: {
  start_date: string;
  end_date: string;
  max_amount?: number;
  document_types?: string[];
  reason?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("approval_delegations")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}

export async function deleteApprovalDelegation(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("approval_delegations")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath(SETTINGS_PATH);
  return { success: true };
}
