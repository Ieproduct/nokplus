"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";
import { requirePermission } from "@/lib/permissions";

export async function getMyCompanies() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("company_members")
    .select("company_id, role, companies(id, name_th, name_en, logo_url)")
    .eq("user_id", user.id);

  if (error) throw error;
  return data;
}

export async function getActiveCompany() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (error) throw error;
  return data;
}

export async function createCompany(input: {
  name_th: string;
  name_en?: string;
  tax_id?: string;
  address_th?: string;
  phone?: string;
  email?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name_th: input.name_th,
      name_en: input.name_en || null,
      tax_id: input.tax_id || null,
      address_th: input.address_th || null,
      phone: input.phone || null,
      email: input.email || null,
    })
    .select()
    .single();

  if (companyError) throw companyError;

  // ผู้สร้างเป็น owner
  const { error: memberError } = await supabase
    .from("company_members")
    .insert({
      company_id: company.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) throw memberError;

  // Set active company
  await supabase
    .from("profiles")
    .update({ active_company_id: company.id })
    .eq("id", user.id);

  // Seed default permissions
  await supabase.rpc("seed_company_permissions", { p_company_id: company.id });

  // Seed default organization levels (L1-L9)
  await supabase.rpc("seed_organization_levels", { p_company_id: company.id });

  revalidatePath("/dashboard");
  return { success: true, id: company.id };
}

export async function updateCompany(input: {
  name_th: string;
  name_en?: string;
  tax_id?: string;
  address_th?: string;
  address_en?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  procurement_contact_name?: string;
  procurement_contact_position?: string;
  procurement_contact_phone?: string;
  procurement_contact_email?: string;
}) {
  await requirePermission("settings.company");
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("companies")
    .update({
      name_th: input.name_th,
      name_en: input.name_en || null,
      tax_id: input.tax_id || null,
      address_th: input.address_th || null,
      address_en: input.address_en || null,
      phone: input.phone || null,
      fax: input.fax || null,
      email: input.email || null,
      website: input.website || null,
      procurement_contact_name: input.procurement_contact_name || null,
      procurement_contact_position: input.procurement_contact_position || null,
      procurement_contact_phone: input.procurement_contact_phone || null,
      procurement_contact_email: input.procurement_contact_email || null,
    })
    .eq("id", companyId);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function switchCompany(companyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // ตรวจสอบว่า user เป็นสมาชิกบริษัทนี้
  const { data: membership } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!membership) throw new Error("คุณไม่ได้เป็นสมาชิกบริษัทนี้");

  const { error } = await supabase
    .from("profiles")
    .update({ active_company_id: companyId })
    .eq("id", user.id);

  if (error) throw error;
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getCompanyMembers() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("company_members")
    .select("*, profiles(full_name, email, position, department)")
    .eq("company_id", companyId)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function addMember(email: string, role: "admin" | "member" = "member", fullName?: string) {
  try {
    await requirePermission("member.manage");
  } catch {
    return { success: false, error: "ไม่มีสิทธิ์จัดการสมาชิก" };
  }
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  // หา user จาก email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  let userId: string;
  let invited = false;
  const displayName = fullName || email.split("@")[0];

  if (profile) {
    userId = profile.id;
    // อัปเดตชื่อถ้ามีการระบุ
    if (fullName) {
      await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    }
  } else {
    const admin = createAdminClient();

    // ตรวจสอบว่ามี auth user อยู่แล้วหรือไม่
    const { data: userList } = await admin.auth.admin.listUsers();
    const existingAuthUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingAuthUser) {
      // มี auth user แต่ไม่มี profile → สร้าง profile ให้
      userId = existingAuthUser.id;
      await admin.from("profiles").upsert({
        id: userId,
        full_name: displayName,
        email: email.toLowerCase(),
        department: "PUR",
        position: "พนักงาน",
      }, { onConflict: "id" });
    } else {
      // ผู้ใช้ใหม่ → เชิญผ่าน Supabase Auth (ส่งอีเมลตั้งรหัสผ่าน)
      const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: displayName },
      });

      if (inviteError) {
        return { success: false, error: `ไม่สามารถเชิญผู้ใช้ได้: ${inviteError.message}` };
      }

      userId = inviteData.user.id;
      invited = true;
    }
  }

  const { error } = await supabase.from("company_members").insert({
    company_id: companyId,
    user_id: userId,
    role,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "ผู้ใช้เป็นสมาชิกอยู่แล้ว" };
    }
    return { success: false, error: "เกิดข้อผิดพลาดในการเพิ่มสมาชิก" };
  }

  revalidatePath("/dashboard/settings");
  return { success: true, invited };
}

export async function removeMember(memberId: string) {
  try {
    await requirePermission("member.manage");
  } catch {
    return { success: false, error: "ไม่มีสิทธิ์จัดการสมาชิก" };
  }
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("company_members")
    .delete()
    .eq("id", memberId)
    .eq("company_id", companyId);

  if (error) return { success: false, error: "เกิดข้อผิดพลาดในการลบสมาชิก" };
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateMemberRole(memberId: string, role: "admin" | "member") {
  try {
    await requirePermission("member.manage");
  } catch {
    return { success: false, error: "ไม่มีสิทธิ์จัดการสมาชิก" };
  }
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("company_members")
    .update({ role })
    .eq("id", memberId)
    .eq("company_id", companyId);

  if (error) return { success: false, error: "เกิดข้อผิดพลาดในการเปลี่ยนบทบาท" };
  revalidatePath("/dashboard/settings");
  return { success: true };
}
