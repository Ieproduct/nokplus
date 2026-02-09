"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, FileText, ShoppingCart, Receipt, CheckSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "pr" | "po" | "ap" | "approval";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const iconMap = {
  pr: FileText,
  po: ShoppingCart,
  ap: Receipt,
  approval: CheckSquare,
};

const colorMap = {
  pr: "bg-nok-blue/10 text-nok-blue",
  po: "bg-nok-success/10 text-nok-success",
  ap: "bg-purple-100 text-purple-600",
  approval: "bg-amber-100 text-amber-600",
};

interface NotificationPanelProps {
  notifications: Notification[];
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-nok-error text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white shadow-xl border z-50 overflow-hidden">
          <div className="flex items-center justify-between bg-linear-to-r from-nok-navy to-nok-blue px-4 py-3">
            <h3 className="text-sm font-semibold text-white">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                {unreadCount} ใหม่
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = iconMap[notif.type];
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-muted/50 cursor-pointer",
                      !notif.read && "bg-blue-50/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        colorMap[notif.type]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-nok-navy truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-[11px] text-muted-foreground/60">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="flex items-start pt-1.5">
                        <div className="h-2 w-2 rounded-full bg-nok-blue" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
