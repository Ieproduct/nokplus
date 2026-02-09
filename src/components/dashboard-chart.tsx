"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface DeptData {
  name: string;
  pr: number;
  po: number;
  ap: number;
}

export function DashboardChart({ data }: { data: DeptData[] }) {
  const hasData = data.some((d) => d.pr > 0 || d.po > 0 || d.ap > 0);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-nok-blue" />
          <CardTitle className="text-base text-nok-navy">
            ข้อมูลการใช้งานตามแผนก
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            ยังไม่มีข้อมูล
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    pr: "ใบขอซื้อ (PR)",
                    po: "ใบสั่งซื้อ (PO)",
                    ap: "ใบสำคัญจ่าย (AP)",
                  };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="pr" name="pr" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="po" name="po" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ap" name="ap" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
