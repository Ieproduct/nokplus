import { Settings } from "lucide-react";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nok-blue/10">
          <Settings className="h-5 w-5 text-nok-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-nok-navy">ตั้งค่าระบบ</h1>
          <p className="text-muted-foreground text-sm">
            จัดการข้อมูลบริษัท เอกสาร การเงิน ผู้ขาย และระบบอนุมัติ
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="w-60 shrink-0">
          <div className="sticky top-6 rounded-xl border bg-white p-3 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
            <SettingsSidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
