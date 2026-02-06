import { createClient } from "@/lib/supabase/server";
import { getMyCompanies } from "@/lib/actions/company";
import { CompanySwitcher } from "@/components/company-switcher";

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

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-2">
        <CompanySwitcher
          companies={companies as any}
          activeCompanyId={activeCompanyId}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">
            {profile?.full_name || user?.email || "ผู้ใช้"}
          </p>
          <p className="text-xs text-muted-foreground">
            {profile?.position || "พนักงาน"} - {profile?.department || ""}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
          {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
