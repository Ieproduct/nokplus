"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";
import { requirePermission, type PermissionKey } from "@/lib/permissions";
import type { Enums } from "@/lib/types";

type CompanyRole = Enums<"company_role">;

export async function getRolePermissions() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .eq("company_id", companyId)
    .order("role")
    .order("permission_key");

  if (error) throw error;
  return data;
}

export async function getUserOverrides() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("user_permission_overrides")
    .select("*, profiles(full_name, email)")
    .eq("company_id", companyId)
    .order("user_id")
    .order("permission_key");

  if (error) throw error;
  return data;
}

export async function updateRolePermission(
  role: CompanyRole,
  key: PermissionKey,
  granted: boolean
) {
  await requirePermission("settings.permissions");

  if (role === "owner") {
    throw new Error("ไม่สามารถเปลี่ยนสิทธิ์ของ Owner ได้");
  }

  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("role_permissions")
    .upsert(
      { company_id: companyId, role, permission_key: key, granted },
      { onConflict: "company_id,role,permission_key" }
    );

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function setUserOverride(
  userId: string,
  key: PermissionKey,
  granted: boolean
) {
  await requirePermission("settings.permissions");

  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("user_permission_overrides")
    .upsert(
      { company_id: companyId, user_id: userId, permission_key: key, granted },
      { onConflict: "company_id,user_id,permission_key" }
    );

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function removeUserOverride(userId: string, key: PermissionKey) {
  await requirePermission("settings.permissions");

  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase
    .from("user_permission_overrides")
    .delete()
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .eq("permission_key", key);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}
