"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface OrgLevel {
  id: string;
  level: number;
  label_th: string;
  label_en: string | null;
  is_active: boolean;
  member_count: number;
}

export function OrgChart({ levels }: { levels: OrgLevel[] }) {
  // แสดง pyramid L9 (บน) → L1 (ล่าง)
  const sortedLevels = [...levels].sort((a, b) => b.level - a.level);

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">แผนผังองค์กร</h3>
        <div className="flex flex-col items-center gap-2">
          {sortedLevels.map((level) => {
            // ปรับความกว้างตาม pyramid (L9 แคบสุด, L1 กว้างสุด)
            const widthPercent = 30 + ((9 - level.level) / 8) * 60;
            const bgColor = getLevelColor(level.level);

            return (
              <div
                key={level.id}
                className="flex items-center justify-center transition-all"
                style={{ width: `${widthPercent}%` }}
              >
                <div
                  className={`w-full rounded-lg px-4 py-3 ${bgColor} border flex items-center justify-between gap-2`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      L{level.level}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {level.label_th}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-xs">{level.member_count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    9: "bg-amber-50 border-amber-300",
    8: "bg-orange-50 border-orange-300",
    7: "bg-red-50 border-red-300",
    6: "bg-purple-50 border-purple-300",
    5: "bg-indigo-50 border-indigo-300",
    4: "bg-blue-50 border-blue-300",
    3: "bg-cyan-50 border-cyan-300",
    2: "bg-teal-50 border-teal-300",
    1: "bg-green-50 border-green-300",
  };
  return colors[level] || "bg-gray-50 border-gray-300";
}
