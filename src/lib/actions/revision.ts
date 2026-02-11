"use server";

import { createClient } from "@/lib/supabase/server";

interface RevisionEntry {
  id: string;
  document_type: string;
  document_id: string;
  revision_number: number;
  changed_by: string;
  changed_at: string;
  changes_json: Record<string, { old: any; new: any }>;
  reason: string | null;
  profiles?: { full_name: string | null } | null;
}

function computeDiff(
  oldData: Record<string, any>,
  newData: Record<string, any>,
  ignoreKeys = ["updated_at", "created_at"]
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    if (ignoreKeys.includes(key)) continue;
    const oldVal = oldData[key] ?? null;
    const newVal = newData[key] ?? null;
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }
  return changes;
}

export async function createRevision(
  docType: string,
  docId: string,
  oldData: Record<string, any>,
  newData: Record<string, any>,
  reason?: string
) {
  const changes = computeDiff(oldData, newData);
  if (Object.keys(changes).length === 0) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ไม่พบผู้ใช้งาน");

  // Get next revision number
  const { data: latest } = await supabase
    .from("document_revisions")
    .select("revision_number")
    .eq("document_type", docType)
    .eq("document_id", docId)
    .order("revision_number", { ascending: false })
    .limit(1);

  const nextRevision = (latest?.[0]?.revision_number || 0) + 1;

  const { data, error } = await supabase
    .from("document_revisions")
    .insert({
      document_type: docType,
      document_id: docId,
      revision_number: nextRevision,
      changed_by: user.id,
      changes_json: changes,
      reason: reason || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRevisions(
  docType: string,
  docId: string
): Promise<RevisionEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("document_revisions")
    .select("*, profiles!document_revisions_changed_by_fkey(full_name)")
    .eq("document_type", docType)
    .eq("document_id", docId)
    .order("revision_number", { ascending: false });

  if (error) throw error;
  return (data as RevisionEntry[]) ?? [];
}
