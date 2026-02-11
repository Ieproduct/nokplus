import { getRolePermissions } from "@/lib/actions/permission";
import { PermissionManager } from "@/components/settings/permission-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Shield } from "lucide-react";

export default async function PermissionsPage() {
  const rolePermissions = await getRolePermissions();

  return (
    <>
      <SettingsPageHeader icon={Shield} title="สิทธิ์ผู้ใช้งาน" description="กำหนดสิทธิ์การเข้าถึงตามบทบาท" />
      <PermissionManager rolePermissions={rolePermissions} />
    </>
  );
}
