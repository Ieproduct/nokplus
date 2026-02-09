import { createClient } from "@/lib/supabase/server";

/**
 * ดึง active_company_id ของ user ที่ login อยู่
 * ถ้ายังไม่มี active company จะ set ให้อัตโนมัติจาก company แรกที่เป็นสมาชิก
 */
export async function getActiveCompanyId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // ดึง active_company_id จาก profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_company_id")
    .eq("id", user.id)
    .single();

  if (profile?.active_company_id) {
    return profile.active_company_id;
  }

  // ถ้ายังไม่มี active company → หา company แรกที่เป็นสมาชิก
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    throw new Error("ผู้ใช้ไม่ได้เป็นสมาชิกบริษัทใดๆ");
  }

  // Set active company
  await supabase
    .from("profiles")
    .update({ active_company_id: membership.company_id })
    .eq("id", user.id);

  return membership.company_id;
}

/**
 * ถ้ามี companyId → ตรวจสอบว่า user เป็นสมาชิกบริษัทนั้นแล้ว return
 * ถ้าไม่มี → return getActiveCompanyId()
 */
export async function getCompanyIdOrActive(companyId?: string): Promise<string> {
  if (!companyId) return getActiveCompanyId();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: membership } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    throw new Error("คุณไม่ได้เป็นสมาชิกบริษัทนี้");
  }

  return companyId;
}

/**
 * ดึงรายชื่อ company_id ทั้งหมดที่ user เป็นสมาชิก
 */
export async function getUserCompanyIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id);

  if (error) throw error;
  return data.map((m) => m.company_id);
}
