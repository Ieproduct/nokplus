"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId, getUserCompanyIds } from "@/lib/company-context";
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
    .select("*, profiles(full_name, email, position, department), companies(name_th, name_en), departments(id, code, name)")
    .eq("company_id", companyId)
    .order("org_level", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch members from ALL companies the user has access to.
 * Used for cross-company org chart.
 */
export async function getAllOrganizationMembers() {
  const supabase = await createClient();
  const companyIds = await getUserCompanyIds();

  if (companyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("company_members")
    .select("*, profiles(full_name, email, position, department), companies(name_th, name_en), departments(id, code, name)")
    .in("company_id", companyIds)
    .order("org_level", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

/**
 * Return companies and departments for filter UI.
 */
export async function getOrganizationFilterData() {
  const supabase = await createClient();
  const companyIds = await getUserCompanyIds();

  if (companyIds.length === 0) return { companies: [], departments: [] };

  const [companiesResult, departmentsResult] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name_th, name_en")
      .in("id", companyIds)
      .order("name_th"),
    supabase
      .from("departments")
      .select("id, code, name, company_id")
      .in("company_id", companyIds)
      .eq("is_active", true)
      .order("name"),
  ]);

  if (companiesResult.error) throw companiesResult.error;
  if (departmentsResult.error) throw departmentsResult.error;

  return {
    companies: companiesResult.data,
    departments: departmentsResult.data,
  };
}

export async function updateMemberOrgLevel(
  memberId: string,
  input: {
    org_level: number | null;
    max_approval_amount: number | null;
    reports_to_member_id?: string | null;
    department_id?: string | null;
  }
) {
  try {
    await requirePermission("settings.organization");
  } catch {
    return { success: false, error: "ไม่มีสิทธิ์ตั้งค่าโครงสร้างองค์กร" };
  }
  const supabase = await createClient();
  const companyIds = await getUserCompanyIds();

  // Validate circular reference if reports_to_member_id is provided
  if (input.reports_to_member_id !== undefined && input.reports_to_member_id !== null) {
    if (input.reports_to_member_id === memberId) {
      return { success: false, error: "ไม่สามารถรายงานตรงต่อตัวเองได้" };
    }

    // Fetch members across all accessible companies for cross-company cycle detection
    const { data: allMembers } = await supabase
      .from("company_members")
      .select("id, reports_to_member_id")
      .in("company_id", companyIds);

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
  if (input.department_id !== undefined) {
    updateData.department_id = input.department_id;
  }

  const { error } = await supabase
    .from("company_members")
    .update(updateData)
    .eq("id", memberId);

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
 * Fetches members across all accessible companies for cross-company chain walking.
 * Returns ordered chain of member records (excluding the starting member).
 */
export async function getReportsToChain(memberId: string) {
  const supabase = await createClient();
  const companyIds = await getUserCompanyIds();

  const { data: allMembers, error } = await supabase
    .from("company_members")
    .select("id, user_id, org_level, max_approval_amount, reports_to_member_id, profiles(full_name)")
    .in("company_id", companyIds);

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
