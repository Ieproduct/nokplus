"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type PermissionKey,
} from "@/lib/permissions.shared";
import { updateRolePermission } from "@/lib/actions/permission";
import { Shield } from "lucide-react";

interface RolePerm {
  id: string;
  role: string;
  permission_key: string;
  granted: boolean;
}

export function PermissionManager({
  rolePermissions,
}: {
  rolePermissions: RolePerm[];
}) {
  const [perms, setPerms] = useState(rolePermissions);
  const [isPending, startTransition] = useTransition();

  function isGranted(role: string, key: string) {
    if (role === "owner") return true;
    const p = perms.find((r) => r.role === role && r.permission_key === key);
    return p?.granted ?? false;
  }

  function togglePermission(role: string, key: PermissionKey) {
    if (role === "owner") return;
    const current = isGranted(role, key);
    const newGranted = !current;

    // Optimistic update
    setPerms((prev) => {
      const idx = prev.findIndex(
        (r) => r.role === role && r.permission_key === key
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], granted: newGranted };
        return updated;
      }
      return [
        ...prev,
        { id: "", role, permission_key: key, granted: newGranted },
      ];
    });

    startTransition(async () => {
      try {
        await updateRolePermission(
          role as "admin" | "member",
          key,
          newGranted
        );
      } catch (err: unknown) {
        toast.error((err as Error).message || "เกิดข้อผิดพลาด");
        // Revert
        setPerms((prev) => {
          const idx = prev.findIndex(
            (r) => r.role === role && r.permission_key === key
          );
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], granted: current };
            return updated;
          }
          return prev;
        });
      }
    });
  }

  const roles = [
    { key: "owner", label: "Owner" },
    { key: "admin", label: "Admin" },
    { key: "member", label: "Member" },
  ];

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-linear-to-r from-nok-navy to-nok-blue text-white">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle className="text-white">จัดการสิทธิ์ตาม Role</CardTitle>
        </div>
        <p className="text-sm text-white/70 mt-1">
          Owner มีสิทธิ์ทุกอย่างเสมอ (ไม่สามารถเปลี่ยนได้)
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium text-nok-navy w-[300px]">
                  สิทธิ์
                </th>
                {roles.map((r) => (
                  <th
                    key={r.key}
                    className="text-center py-2 px-3 font-medium text-nok-navy w-24"
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <>
                  <tr key={group.label}>
                    <td
                      colSpan={4}
                      className="pt-4 pb-1 px-3 font-semibold text-nok-blue text-xs uppercase tracking-wider"
                    >
                      {group.label}
                    </td>
                  </tr>
                  {group.keys.map((key) => (
                    <tr
                      key={key}
                      className="border-b border-gray-100 hover:bg-blue-50/30"
                    >
                      <td className="py-2 px-3 text-muted-foreground">
                        {PERMISSION_LABELS[key]}
                      </td>
                      {roles.map((r) => (
                        <td key={r.key} className="text-center py-2 px-3">
                          <Checkbox
                            checked={isGranted(r.key, key)}
                            disabled={r.key === "owner" || isPending}
                            onCheckedChange={() =>
                              togglePermission(r.key, key)
                            }
                            className={
                              r.key === "owner"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
