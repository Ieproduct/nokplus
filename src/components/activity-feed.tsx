import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  tableName: string;
  recordId: string;
  changedBy: string;
  createdAt: string | null;
}

const TABLE_LABELS: Record<string, string> = {
  purchase_requisitions: "ใบขอซื้อ",
  purchase_orders: "ใบสั่งซื้อ",
  ap_vouchers: "ใบสำคัญจ่าย",
  vendors: "ผู้ขาย",
  approvals: "การอนุมัติ",
  companies: "บริษัท",
  departments: "แผนก",
  profiles: "ผู้ใช้",
};

const ACTION_LABELS: Record<string, string> = {
  INSERT: "สร้าง",
  UPDATE: "แก้ไข",
  DELETE: "ลบ",
};

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} ชม.ที่แล้ว`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-nok-blue" />
          <CardTitle className="text-base text-nok-navy">
            กิจกรรมล่าสุด
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            ยังไม่มีกิจกรรม
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border p-3 bg-white"
              >
                <div className="mt-0.5 h-2 w-2 rounded-full bg-nok-blue shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-nok-navy">
                      {item.changedBy}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {ACTION_LABELS[item.action] || item.action}{" "}
                      {TABLE_LABELS[item.tableName] || item.tableName}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
