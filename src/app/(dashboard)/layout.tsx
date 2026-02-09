import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { PermissionProvider } from "@/components/permission-gate";
import { getPermissionsArray } from "@/lib/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let permissions: Awaited<ReturnType<typeof getPermissionsArray>> = [];
  try {
    permissions = await getPermissionsArray();
  } catch {
    // Will fallback to empty permissions
  }

  return (
    <PermissionProvider permissions={permissions}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-[#f0f4f8] p-6">
            {children}
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}
