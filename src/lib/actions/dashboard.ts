"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/company-context";

export async function getFullDashboardStats(filters?: {
  department?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const companyId = await getActiveCompanyId();

  // Parallel queries
  const [
    membersResult,
    departmentsResult,
    prResult,
    poResult,
    apResult,
    vendorResult,
    pendingApprovalsResult,
    auditResult,
  ] = await Promise.all([
    supabase
      .from("company_members")
      .select("id", { count: "exact" })
      .eq("company_id", companyId),
    supabase
      .from("departments")
      .select("id, name", { count: "exact" })
      .eq("company_id", companyId)
      .eq("is_active", true),
    buildDocQuery(supabase, "purchase_requisitions", companyId, filters),
    buildDocQuery(supabase, "purchase_orders", companyId, filters),
    buildDocQuery(supabase, "ap_vouchers", companyId, filters),
    supabase
      .from("vendors")
      .select("id", { count: "exact" })
      .eq("company_id", companyId),
    supabase
      .from("approvals")
      .select("id", { count: "exact" })
      .eq("company_id", companyId)
      .eq("approver_id", user.id)
      .is("action", null),
    supabase
      .from("audit_log")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const prData = prResult.data || [];
  const poData = poResult.data || [];
  const apData = apResult.data || [];

  // Department usage chart data
  const deptMap: Record<string, { name: string; pr: number; po: number; ap: number }> = {};
  for (const dept of departmentsResult.data || []) {
    deptMap[dept.name] = { name: dept.name, pr: 0, po: 0, ap: 0 };
  }
  for (const doc of prData) {
    const d = (doc as { department: string }).department;
    if (!deptMap[d]) deptMap[d] = { name: d, pr: 0, po: 0, ap: 0 };
    deptMap[d].pr++;
  }
  for (const doc of poData) {
    const d = (doc as { department: string }).department;
    if (!deptMap[d]) deptMap[d] = { name: d, pr: 0, po: 0, ap: 0 };
    deptMap[d].po++;
  }
  for (const doc of apData) {
    const d = (doc as { department: string }).department;
    if (!deptMap[d]) deptMap[d] = { name: d, pr: 0, po: 0, ap: 0 };
    deptMap[d].ap++;
  }

  return {
    overview: {
      memberCount: membersResult.count || 0,
      departmentCount: departmentsResult.count || 0,
      totalDocuments: prData.length + poData.length + apData.length,
    },
    departmentUsage: Object.values(deptMap),
    recentActivity: (auditResult.data || []).map((log) => ({
      id: log.id,
      action: log.action,
      tableName: log.table_name,
      recordId: log.record_id,
      changedBy: (log as any).profiles?.full_name || "ระบบ",
      createdAt: log.created_at,
    })),
    moduleStats: {
      pr: {
        total: prData.length,
        draft: prData.filter((r: any) => r.status === "draft").length,
        pending: prData.filter((r: any) => r.status === "pending_approval").length,
        approved: prData.filter((r: any) => r.status === "approved").length,
      },
      po: {
        total: poData.length,
        draft: poData.filter((r: any) => r.status === "draft").length,
        pending: poData.filter((r: any) => r.status === "pending_approval").length,
        approved: poData.filter((r: any) => r.status === "approved").length,
      },
      ap: {
        total: apData.length,
        draft: apData.filter((r: any) => r.status === "draft").length,
        pending: apData.filter((r: any) => r.status === "pending_approval").length,
        unpaid: apData.filter((r: any) => r.payment_status === "unpaid").length,
        paid: apData.filter((r: any) => r.payment_status === "paid").length,
      },
      vendors: vendorResult.count || 0,
      pendingApprovals: pendingApprovalsResult.count || 0,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDocQuery(supabase: any, table: string, companyId: string, filters?: { department?: string; dateFrom?: string; dateTo?: string }) {
  let query = supabase
    .from(table)
    .select("status, department, payment_status, created_at")
    .eq("company_id", companyId);

  if (filters?.department) {
    query = query.eq("department", filters.department);
  }
  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo + "T23:59:59");
  }

  return query;
}

export async function getDepartmentList() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data } = await supabase
    .from("departments")
    .select("name")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name");

  return (data || []).map((d) => d.name);
}
