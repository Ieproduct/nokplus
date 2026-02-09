"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PermissionKey } from "@/lib/permissions.shared";

const PermissionContext = createContext<PermissionKey[]>([]);

export function PermissionProvider({
  permissions,
  children,
}: {
  permissions: PermissionKey[];
  children: ReactNode;
}) {
  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
}

export function useHasPermission(key: PermissionKey): boolean {
  const permissions = useContext(PermissionContext);
  return permissions.includes(key);
}

export function usePermissions(): PermissionKey[] {
  return useContext(PermissionContext);
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const has = useHasPermission(permission);
  return has ? <>{children}</> : <>{fallback}</>;
}
