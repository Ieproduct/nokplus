"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";
import { requirePermission } from "@/lib/permissions";

export async function getOrganizationLevels() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data: levels, error } = await supabase
    .from("organization_levels")
    .select("*")
    .eq("company_id", companyId)
    .order("level");

  if (error) throw error;

  // Count members per level
  const { data: members, error: membersError } = await supabase
    .from("company_members")
    .select("org_level")
    .eq("company_id", companyId)
    .not("org_level", "is", null);

  if (membersError) throw membersError;

  const countByLevel: Record<number, number> = {};
  for (const m of members || []) {
    if (m.org_level) {
      countByLevel[m.org_level] = (countByLevel[m.org_level] || 0) + 1;
    }
  }

  return levels.map((l) => ({
    ...l,
    member_count: countByLevel[l.level] || 0,
  }));
}

export async function updateOrganizationLevel(
  levelId: string,
  input: { label_th: string; label_en?: string }
) {
  try {
    await requirePermission("settings.organization");
  } catch {
    return { success: false, error: "ไม่มีสิทธิ์ตั้งค่าโครงสร้างองค์กร" };
  }
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_levels")
    .update({
      label_th: input.label_th,
      label_en: input.label_en || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", levelId);

  if (error) return { success: false, error: "เกิดข้อผิดพลาดในการบันทึก" };
  revalidatePath("/dashboard/organization");
  return { success: true };
}

export async function getOrganizationMembers() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("company_members")
    .select("*, profiles(full_name, email, position, department)")
    .eq("company_id", companyId)
    .order("org_level", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

export async function updateMemberOrgLevel(
  memberId: string,
  input: {
    org_level: number | null;
    max_approval_amount: number | null;
    reports_to_member_id?: string | null;
  }
) {
  try {
    await requirePermission("settings.organization");
  } catch {
    return { success: false, error: "ไม่มีสิทธิ์ตั้งค่าโครงสร้างองค์กร" };
  }
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  // Validate circular reference if reports_to_member_id is provided
  if (input.reports_to_member_id !== undefined && input.reports_to_member_id !== null) {
    if (input.reports_to_member_id === memberId) {
      return { success: false, error: "ไม่สามารถรายงานตรงต่อตัวเองได้" };
    }

    const { data: allMembers } = await supabase
      .from("company_members")
      .select("id, reports_to_member_id")
      .eq("company_id", companyId);

    if (allMembers) {
      const reportsToMap = new Map<string, string | null>();
      for (const m of allMembers) {
        reportsToMap.set(m.id, m.reports_to_member_id);
      }
      // Temporarily set the new relationship
      reportsToMap.set(memberId, input.reports_to_member_id);

      // Walk the chain from the target to detect cycles
      const visited = new Set<string>();
      let current: string | null = input.reports_to_member_id;
      while (current) {
        if (visited.has(current)) {
          return { success: false, error: "ไม่สามารถกำหนดได้ เพราะจะเกิดสายบังคับบัญชาวนรอบ (circular)" };
        }
        visited.add(current);
        current = reportsToMap.get(current) ?? null;
      }
    }
  }

  const updateData: Record<string, unknown> = {
    org_level: input.org_level,
    max_approval_amount: input.max_approval_amount,
  };
  if (input.reports_to_member_id !== undefined) {
    updateData.reports_to_member_id = input.reports_to_member_id;
  }

  const { error } = await supabase
    .from("company_members")
    .update(updateData)
    .eq("id", memberId)
    .eq("company_id", companyId);

  if (error) return { success: false, error: "เกิดข้อผิดพลาดในการบันทึก" };
  revalidatePath("/dashboard/organization");
  return { success: true };
}

export async function getMembersAtLevel(level: number) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("company_members")
    .select("user_id, profiles(full_name)")
    .eq("company_id", companyId)
    .eq("org_level", level);

  if (error) throw error;
  return data;
}

/**
 * Walk the reports_to chain upward from a member.
 * Returns ordered chain of member records (excluding the starting member).
 */
export async function getReportsToChain(memberId: string, companyId: string) {
  const supabase = await createClient();

  const { data: allMembers, error } = await supabase
    .from("company_members")
    .select("id, user_id, org_level, max_approval_amount, reports_to_member_id, profiles(full_name)")
    .eq("company_id", companyId);

  if (error) throw error;
  if (!allMembers) return [];

  const memberMap = new Map(allMembers.map((m) => [m.id, m]));
  const chain: typeof allMembers = [];
  const visited = new Set<string>();

  let current = memberMap.get(memberId);
  if (!current) return [];

  let nextId = current.reports_to_member_id;
  while (nextId && !visited.has(nextId)) {
    visited.add(nextId);
    const next = memberMap.get(nextId);
    if (!next) break;
    chain.push(next);
    nextId = next.reports_to_member_id;
  }

  return chain;
}
