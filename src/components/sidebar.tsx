"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Receipt,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/dashboard/vendors", label: "ผู้ขาย", icon: Users },
  { href: "/dashboard/pr", label: "ใบขอซื้อ (PR)", icon: FileText },
  { href: "/dashboard/po", label: "ใบสั่งซื้อ (PO)", icon: ShoppingCart },
  { href: "/dashboard/ap", label: "ใบสำคัญจ่าย (AP)", icon: Receipt },
  { href: "/dashboard/approvals", label: "อนุมัติ", icon: CheckSquare },
  { href: "/dashboard/reports", label: "รายงาน", icon: BarChart3 },
  { href: "/dashboard/settings", label: "ตั้งค่า", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            N+
          </div>
          <span className="text-lg font-semibold">NokPlus</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </Button>
      </div>
    </aside>
  );
}
