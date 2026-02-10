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
  input: { org_level: number | null; max_approval_amount: number | null }
) {
  try {
    await requirePermission("settings.organization");
  } catch {
    return { success: false, error: "ไม่มีสิทธิ์ตั้งค่าโครงสร้างองค์กร" };
  }
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("company_members")
    .update({
      org_level: input.org_level,
      max_approval_amount: input.max_approval_amount,
    })
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
