"use client";

import { useState } from "react";
import { updateNotificationSetting } from "@/lib/actions/notification";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  event_type: string;
  event_label: string;
  channel: string;
  is_enabled: boolean;
  recipients: string | null;
}

const GROUP_LABELS: Record<string, string> = {
  pr_: "ใบขอซื้อ (PR)",
  po_: "ใบสั่งซื้อ (PO)",
  ap_: "ใบตั้งหนี้ (AP)",
  delegation_: "การมอบอำนาจ",
  budget_: "งบประมาณ",
};

function getGroupKey(eventType: string): string {
  for (const prefix of Object.keys(GROUP_LABELS)) {
    if (eventType.startsWith(prefix)) return prefix;
  }
  return "other_";
}

function groupSettings(settings: NotificationSetting[]) {
  const groups: Record<string, NotificationSetting[]> = {};

  for (const s of settings) {
    const key = getGroupKey(s.event_type);
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }

  return groups;
}

export function NotificationManager({ settings }: { settings: NotificationSetting[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleToggle(setting: NotificationSetting, enabled: boolean) {
    setLoading(setting.id);
    try {
      await updateNotificationSetting(setting.id, { is_enabled: enabled });
      toast.success(enabled ? "เปิดการแจ้งเตือนแล้ว" : "ปิดการแจ้งเตือนแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(null);
    }
  }

  const grouped = groupSettings(settings);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="font-medium">ตั้งค่าการแจ้งเตือน</h3>
          <p className="text-sm text-muted-foreground mt-1">เปิด/ปิดการแจ้งเตือนสำหรับแต่ละเหตุการณ์</p>
        </div>

        <div className="space-y-6">
          {Object.entries(grouped).map(([groupKey, items]) => (
            <div key={groupKey}>
              <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                {GROUP_LABELS[groupKey] || "อื่นๆ"}
              </h4>
              <div className="space-y-2">
                {items.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{setting.event_label}</Label>
                        <Badge variant="secondary" className="text-xs">
                          {setting.channel}
                        </Badge>
                      </div>
                      {setting.recipients && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          ผู้รับ: {setting.recipients}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={setting.is_enabled}
                      disabled={loading === setting.id}
                      onCheckedChange={(v) => handleToggle(setting, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {settings.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              ยังไม่มีการตั้งค่าการแจ้งเตือน
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
