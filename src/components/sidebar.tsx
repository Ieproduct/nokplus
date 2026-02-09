"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/components/permission-gate";
import type { PermissionKey } from "@/lib/permissions.shared";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  FileText,
  ShoppingCart,
  Receipt,
  Workflow,
  FileCog,
  CheckSquare,
  Building,
  Shield,
  BarChart3,
  LogOut,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: PermissionKey;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: "",
    defaultOpen: true,
    items: [
      { href: "/dashboard", label: "ข้อมูลสถิติภาพรวม", icon: LayoutDashboard, permission: "dashboard.view" },
    ],
  },
  {
    label: "การบริหารจัดการองค์กร",
    items: [
      { href: "/dashboard/vendors", label: "ผู้ขาย", icon: Users, permission: "vendor.view" },
      { href: "/dashboard/settings?tab=members", label: "สมาชิก", icon: UserCog, permission: "member.view" },
      { href: "/dashboard/settings?tab=departments", label: "แผนก", icon: Building2, permission: "department.view" },
    ],
  },
  {
    label: "การบริหารจัดการเอกสาร",
    items: [
      { href: "/dashboard/pr", label: "ใบขอซื้อ (PR)", icon: FileText, permission: "pr.view" },
      { href: "/dashboard/po", label: "ใบสั่งซื้อ (PO)", icon: ShoppingCart, permission: "po.view" },
      { href: "/dashboard/ap", label: "ใบสำคัญจ่าย (AP)", icon: Receipt, permission: "ap.view" },
    ],
  },
  {
    label: "การตั้งค่าเอกสาร",
    items: [
      { href: "/dashboard/settings?tab=approvals", label: "ระบบอนุมัติ", icon: Workflow, permission: "settings.flows" },
      { href: "/dashboard/settings?tab=system", label: "ตั้งค่าเอกสาร", icon: FileCog, permission: "settings.system" },
    ],
  },
  {
    label: "อนุมัติรายการ",
    items: [
      { href: "/dashboard/approvals", label: "รายการอนุมัติ", icon: CheckSquare, permission: "approval.view" },
    ],
  },
  {
    label: "การตั้งค่าระบบ",
    items: [
      { href: "/dashboard/settings?tab=company", label: "ข้อมูลบริษัท", icon: Building, permission: "settings.company" },
      { href: "/dashboard/settings?tab=permissions", label: "สิทธิ์ผู้ใช้งาน", icon: Shield, permission: "settings.permissions" },
      { href: "/dashboard/reports", label: "รายงาน", icon: BarChart3, permission: "reports.view" },
    ],
  },
];

function NavItemLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-nok-blue text-white shadow-lg shadow-nok-blue/25"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <item.icon className="h-4.5 w-4.5 shrink-0" />
      {item.label}
    </Link>
  );
}

function FilteredNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const hasPermission = useHasPermission(item.permission || "dashboard.view");
  if (!hasPermission) return null;
  return <NavItemLink item={item} isActive={isActive} />;
}

function SidebarGroup({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? true);

  const isGroupActive = group.items.some((item) => {
    if (item.href.includes("?")) {
      const base = item.href.split("?")[0];
      return pathname === base || pathname.startsWith(base + "/");
    }
    return item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);
  });

  const visibleItems = group.items;

  if (!group.label) {
    return (
      <div className="space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href.split("?")[0]) && item.href !== "/dashboard";
          return (
            <FilteredNavItem key={item.href} item={item} isActive={isActive} />
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
          isGroupActive ? "text-white/90" : "text-white/40 hover:text-white/60"
        )}
      >
        {group.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-0.5 space-y-0.5 pl-0">
          {visibleItems.map((item) => {
            const itemBase = item.href.split("?")[0];
            const isActive = item.href.includes("?tab=")
              ? pathname === itemBase && item.href.includes(`tab=${new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("tab")}`)
              : item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(itemBase) && itemBase !== "/dashboard";
            return (
              <FilteredNavItem key={item.href} item={item} isActive={isActive} />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-nok-navy">
      {/* Logo Area */}
      <div className="flex h-16 items-center gap-3 px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nok-blue text-white font-bold text-sm">
            N+
          </div>
          <span className="text-lg font-semibold text-white">NokPlus</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Navigation */}
      <nav className="flex-1 space-y-3 px-3 py-4 overflow-y-auto">
        {navGroups.map((group, i) => (
          <SidebarGroup key={group.label || i} group={group} />
        ))}
      </nav>

      {/* Logout */}
      <div className="mx-4 border-t border-white/10" />
      <div className="p-3">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
