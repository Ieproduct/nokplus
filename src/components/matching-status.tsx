"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { performThreeWayMatch, forceMatch } from "@/lib/actions/matching";
import { toast } from "sonner";

interface MatchLine {
  po_line_item_id: string;
  description: string;
  po_qty: number;
  gr_qty: number;
  invoice_qty: number;
  po_price: number;
  invoice_price: number;
  qty_variance: number;
  price_variance: number;
  status: "matched" | "within_tolerance" | "exceeded";
}

interface MatchingStatusProps {
  apId: string;
  matchingStatus?: string | null;
  matchingResult?: any;
}

const STATUS_COLORS: Record<string, string> = {
  matched: "bg-green-100 text-green-700",
  within_tolerance: "bg-yellow-100 text-yellow-700",
  exceeded: "bg-red-100 text-red-700",
  unmatched: "bg-gray-100 text-gray-700",
  tolerance_exceeded: "bg-red-100 text-red-700",
  force_matched: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  matched: "ตรงกัน",
  within_tolerance: "อยู่ในช่วงที่ยอมรับ",
  exceeded: "เกินค่าที่ยอมรับ",
  unmatched: "ยังไม่จับคู่",
  tolerance_exceeded: "เกินค่าที่ยอมรับ",
  force_matched: "บังคับจับคู่",
};

export function MatchingStatus({ apId, matchingStatus, matchingResult }: MatchingStatusProps) {
  const [isPending, startTransition] = useTransition();
  const [lines, setLines] = useState<MatchLine[]>(matchingResult?.lines || []);
  const [status, setStatus] = useState(matchingStatus || "unmatched");
  const [forceReason, setForceReason] = useState("");
  const [showForce, setShowForce] = useState(false);

  const handleMatch = () => {
    startTransition(async () => {
      try {
        const result = await performThreeWayMatch(apId);
        setLines(result.lines);
        setStatus(result.status);
        toast.success("จับคู่เอกสารเรียบร้อย");
      } catch (err: any) {
        toast.error(err.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const handleForceMatch = () => {
    if (!forceReason.trim()) {
      toast.error("กรุณาระบุเหตุผล");
      return;
    }
    startTransition(async () => {
      try {
        await forceMatch(apId, forceReason);
        setStatus("force_matched");
        setShowForce(false);
        toast.success("บังคับจับคู่เรียบร้อย");
      } catch (err: any) {
        toast.error(err.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">สถานะการจับคู่เอกสาร (3-Way Matching)</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[status] || STATUS_COLORS.unmatched}>
            {STATUS_LABELS[status] || status}
          </Badge>
          {status !== "force_matched" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMatch}
              disabled={isPending}
            >
              {isPending ? "กำลังจับคู่..." : "จับคู่เอกสาร"}
            </Button>
          )}
        </div>
      </CardHeader>
      {lines.length > 0 && (
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead className="text-right">PO จำนวน</TableHead>
                  <TableHead className="text-right">GR จำนวน</TableHead>
                  <TableHead className="text-right">Invoice จำนวน</TableHead>
                  <TableHead className="text-right">ส่วนต่างจำนวน %</TableHead>
                  <TableHead className="text-right">ส่วนต่างราคา %</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{line.description}</TableCell>
                    <TableCell className="text-right">{line.po_qty}</TableCell>
                    <TableCell className="text-right">{line.gr_qty}</TableCell>
                    <TableCell className="text-right">{line.invoice_qty}</TableCell>
                    <TableCell className="text-right">{line.qty_variance}%</TableCell>
                    <TableCell className="text-right">{line.price_variance}%</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[line.status]}>
                        {STATUS_LABELS[line.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {status === "tolerance_exceeded" && !showForce && (
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowForce(true)}
              >
                บังคับจับคู่
              </Button>
            </div>
          )}

          {showForce && (
            <div className="mt-3 flex items-center gap-2">
              <Input
                placeholder="ระบุเหตุผลในการบังคับจับคู่"
                value={forceReason}
                onChange={(e) => setForceReason(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={handleForceMatch}
                disabled={isPending}
              >
                ยืนยัน
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForce(false)}
              >
                ยกเลิก
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
