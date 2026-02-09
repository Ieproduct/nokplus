import { createClient } from "@/lib/supabase/server";
import { getMyCompanies } from "@/lib/actions/company";
import { CompanySwitcher } from "@/components/company-switcher";
import { NotificationPanel } from "@/components/notification-panel";
import { ProfileModal } from "@/components/profile-modal";

export async function Topbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let companies: Awaited<ReturnType<typeof getMyCompanies>> = [];
  let activeCompanyId = "";

  if (user) {
    const [profileResult, companiesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, department, position, active_company_id")
        .eq("id", user.id)
        .single(),
      getMyCompanies(),
    ]);
    profile = profileResult.data;
    companies = companiesResult;
    activeCompanyId = profile?.active_company_id || "";
  }

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ")
    .map((s: string) => s.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Sample notifications (in a real app, these would come from the database)
  const notifications = [
    {
      id: "1",
      type: "approval" as const,
      title: "รอการอนุมัติ PR",
      message: "PR-2568-0012 รอการอนุมัติจากคุณ",
      time: "5 นาทีที่แล้ว",
      read: false,
    },
    {
      id: "2",
      type: "po" as const,
      title: "PO อนุมัติแล้ว",
      message: "PO-2568-0008 ได้รับการอนุมัติเรียบร้อย",
      time: "1 ชม. ที่แล้ว",
      read: false,
    },
    {
      id: "3",
      type: "ap" as const,
      title: "AP ชำระเงินแล้ว",
      message: "AP-2568-0005 ชำระเงินเรียบร้อย",
      time: "3 ชม. ที่แล้ว",
      read: true,
    },
  ];

  return (
    <header className="flex h-16 items-center justify-between bg-linear-to-r from-nok-navy to-nok-blue px-6 shadow-md">
      <div className="flex items-center gap-2">
        <CompanySwitcher
          companies={companies as any}
          activeCompanyId={activeCompanyId}
        />
      </div>
      <div className="flex items-center gap-3">
        <NotificationPanel notifications={notifications} />
        <ProfileModal
          fullName={profile?.full_name || user?.email || "ผู้ใช้"}
          email={user?.email || ""}
          position={profile?.position || null}
          department={profile?.department || null}
          initials={initials}
        />
      </div>
    </header>
  );
}
