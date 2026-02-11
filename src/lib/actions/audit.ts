"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAuditLogs(limit: number = 50, offset: number = 0) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_log")
    .select("*, profiles:changed_by(full_name, email)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getAuditLogCount() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("audit_log")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}
