"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Settings, LogOut, Building2, Mail, Briefcase } from "lucide-react";
import Link from "next/link";

interface ProfileModalProps {
  fullName: string;
  email: string;
  position: string | null;
  department: string | null;
  initials: string;
}

export function ProfileModal({
  fullName,
  email,
  position,
  department,
  initials,
}: ProfileModalProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{fullName}</p>
          <p className="text-xs text-white/70">{position || "พนักงาน"}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white text-sm font-semibold ring-2 ring-white/30">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-white shadow-xl border z-50 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-linear-to-r from-nok-navy to-nok-blue px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white text-lg font-bold ring-2 ring-white/30">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{fullName}</p>
                <p className="text-xs text-white/70">{position || "พนักงาน"}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-4 py-3 space-y-2 border-b">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            {department && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span>{department}</span>
              </div>
            )}
            {position && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>{position}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-nok-navy transition-colors hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              ตั้งค่าระบบ
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-nok-error transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
