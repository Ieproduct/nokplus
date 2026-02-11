import { getNotificationSettings } from "@/lib/actions/notification";
import { NotificationManager } from "@/components/settings/notification-manager";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const settings = await getNotificationSettings();

  return (
    <>
      <SettingsPageHeader icon={Bell} title="การแจ้งเตือน" description="ตั้งค่าการแจ้งเตือนตามเหตุการณ์" />
      <NotificationManager settings={settings} />
    </>
  );
}
