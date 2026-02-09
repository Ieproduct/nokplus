import { getPendingApprovals } from "@/lib/actions/approval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalList } from "@/components/approval-list";
import { CheckSquare } from "lucide-react";

export default async function ApprovalsPage() {
  let approvals: Awaited<ReturnType<typeof getPendingApprovals>> = [];
  try {
    approvals = await getPendingApprovals();
  } catch {
    // empty
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
          <CheckSquare className="h-5 w-5 text-nok-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-nok-navy">อนุมัติเอกสาร</h1>
          <p className="text-muted-foreground text-sm">รายการเอกสารที่รออนุมัติ</p>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-linear-to-r from-nok-navy to-nok-blue text-white">
          <CardTitle className="text-white">รออนุมัติ ({approvals.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ApprovalList approvals={approvals} />
        </CardContent>
      </Card>
    </div>
  );
}
