import { getPendingApprovals } from "@/lib/actions/approval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalList } from "@/components/approval-list";

export default async function ApprovalsPage() {
  let approvals: Awaited<ReturnType<typeof getPendingApprovals>> = [];
  try {
    approvals = await getPendingApprovals();
  } catch {
    // empty
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">อนุมัติเอกสาร</h1>
        <p className="text-muted-foreground">รายการเอกสารที่รออนุมัติ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รออนุมัติ ({approvals.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <ApprovalList approvals={approvals} />
        </CardContent>
      </Card>
    </div>
  );
}
