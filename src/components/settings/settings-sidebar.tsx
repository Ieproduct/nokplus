"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building, Building2, Users, UserCog, Network,
  FileText, Ruler, LayoutGrid, GitCompareArrows,
  Banknote, Calendar, CreditCard, Receipt, Gauge, PiggyBank,
  Tags, FileCheck, ClipboardList,
  Workflow, GitBranch,
  Shield, Bell, ScrollText,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

const sections: SidebarSection[] = [
  {
    label: "องค์กร",
    items: [
      { href: "/dashboard/settings/organization/company", label: "ข้อมูลบริษัท", icon: Building },
      { href: "/dashboard/settings/organization/purchasing-orgs", label: "หน่วยจัดซื้อ", icon: Network },
      { href: "/dashboard/settings/organization/departments", label: "แผนก", icon: Building2 },
      { href: "/dashboard/settings/organization/cost-centers", label: "Cost Center", icon: Tags },
    ],
  },
  {
    label: "สมาชิก",
    items: [
      { href: "/dashboard/settings/members/list", label: "รายชื่อสมาชิก", icon: Users },
      { href: "/dashboard/settings/members/org-levels", label: "ระดับองค์กร", icon: UserCog },
      { href: "/dashboard/settings/members/delegation", label: "มอบอำนาจ", icon: GitBranch },
    ],
  },
  {
    label: "เอกสาร",
    items: [
      { href: "/dashboard/settings/documents/number-ranges", label: "เลขที่เอกสาร", icon: FileText },
      { href: "/dashboard/settings/documents/units", label: "หน่วยนับ", icon: Ruler },
      { href: "/dashboard/settings/documents/field-controls", label: "การควบคุมฟิลด์", icon: LayoutGrid },
      { href: "/dashboard/settings/documents/matching-rules", label: "กฎการจับคู่", icon: GitCompareArrows },
    ],
  },
  {
    label: "การเงิน",
    items: [
      { href: "/dashboard/settings/finance/currency", label: "สกุลเงิน", icon: Banknote },
      { href: "/dashboard/settings/finance/fiscal-year", label: "ปีงบประมาณ", icon: Calendar },
      { href: "/dashboard/settings/finance/payment-terms", label: "เงื่อนไขชำระ", icon: CreditCard },
      { href: "/dashboard/settings/finance/tax", label: "ภาษี", icon: Receipt },
      { href: "/dashboard/settings/finance/tolerance", label: "ค่าความคลาดเคลื่อน", icon: Gauge },
      { href: "/dashboard/settings/finance/budget", label: "งบประมาณ", icon: PiggyBank },
    ],
  },
  {
    label: "ผู้ขาย",
    items: [
      { href: "/dashboard/settings/vendors/groups", label: "กลุ่มผู้ขาย", icon: Tags },
      { href: "/dashboard/settings/vendors/documents", label: "เอกสารผู้ขาย", icon: FileCheck },
      { href: "/dashboard/settings/vendors/ap-checklist", label: "AP Checklist", icon: ClipboardList },
    ],
  },
  {
    label: "การอนุมัติ",
    items: [
      { href: "/dashboard/settings/approvals/tiers", label: "ระดับอนุมัติ", icon: Workflow },
      { href: "/dashboard/settings/approvals/flows", label: "สายอนุมัติ", icon: GitBranch },
    ],
  },
  {
    label: "ความปลอดภัย",
    items: [
      { href: "/dashboard/settings/security/permissions", label: "สิทธิ์ผู้ใช้งาน", icon: Shield },
      { href: "/dashboard/settings/security/notifications", label: "การแจ้งเตือน", icon: Bell },
      { href: "/dashboard/settings/security/audit-log", label: "Audit Log", icon: ScrollText },
    ],
  },
];

function SectionGroup({ section }: { section: SidebarSection }) {
  const pathname = usePathname();
  const isActive = section.items.some((item) => pathname === item.href);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
          isActive ? "text-nok-navy" : "text-muted-foreground hover:text-nok-navy"
        )}
      >
        {section.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-0.5 space-y-0.5">
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-nok-blue text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-nok-navy"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SettingsSidebar() {
  return (
    <nav className="space-y-4">
      {sections.map((section) => (
        <SectionGroup key={section.label} section={section} />
      ))}
    </nav>
  );
}
