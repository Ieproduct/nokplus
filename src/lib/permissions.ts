import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/company-context";

export {
  PERMISSION_KEYS,
  PERMISSION_LABELS,
  PERMISSION_GROUPS,
  type PermissionKey,
} from "./permissions.shared";

import { PERMISSION_KEYS, PERMISSION_LABELS, type PermissionKey } from "./permissions.shared";

export async function getUserPermissions(): Promise<Set<PermissionKey>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const companyId = await getActiveCompanyId();

  // Get user's role in this company
  const { data: membership, error: memberError } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .single();

  if (memberError) {
    console.error("Permission lookup error:", memberError, { companyId, userId: user.id });
  }
  if (!membership) throw new Error("ไม่ได้เป็นสมาชิกบริษัทนี้");

  // Owner always has all permissions
  if (membership.role === "owner") {
    return new Set(PERMISSION_KEYS);
  }

  // Get role-based permissions
  const { data: rolePerms } = await supabase
    .from("role_permissions")
    .select("permission_key, granted")
    .eq("company_id", companyId)
    .eq("role", membership.role);

  const perms = new Set<PermissionKey>();
  for (const rp of rolePerms || []) {
    if (rp.granted) {
      perms.add(rp.permission_key as PermissionKey);
    }
  }

  // Apply user-level overrides
  const { data: overrides } = await supabase
    .from("user_permission_overrides")
    .select("permission_key, granted")
    .eq("company_id", companyId)
    .eq("user_id", user.id);

  for (const o of overrides || []) {
    if (o.granted) {
      perms.add(o.permission_key as PermissionKey);
    } else {
      perms.delete(o.permission_key as PermissionKey);
    }
  }

  return perms;
}

export async function requirePermission(key: PermissionKey): Promise<void> {
  const perms = await getUserPermissions();
  if (!perms.has(key)) {
    throw new Error(`ไม่มีสิทธิ์: ${PERMISSION_LABELS[key]}`);
  }
}

export async function hasPermission(key: PermissionKey): Promise<boolean> {
  const perms = await getUserPermissions();
  return perms.has(key);
}

export async function getPermissionsArray(): Promise<PermissionKey[]> {
  const perms = await getUserPermissions();
  return Array.from(perms);
}
