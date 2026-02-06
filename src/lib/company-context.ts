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
