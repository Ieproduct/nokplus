import { getAuditLogs, getAuditLogCount } from "@/lib/actions/audit";
import { AuditLogViewer } from "@/components/settings/audit-log-viewer";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { ScrollText } from "lucide-react";

export default async function AuditLogPage() {
  const [logs, totalCount] = await Promise.all([
    getAuditLogs(),
    getAuditLogCount(),
  ]);

  return (
    <>
      <SettingsPageHeader icon={ScrollText} title="Audit Log" description="ประวัติการเปลี่ยนแปลงข้อมูลในระบบ" />
      <AuditLogViewer logs={logs as any} totalCount={totalCount} />
    </>
  );
}
