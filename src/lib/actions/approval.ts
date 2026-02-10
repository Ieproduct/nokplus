"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";
import { requirePermission } from "@/lib/permissions";

export async function getPendingApprovals() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("approvals")
    .select("*, profiles!approvals_approver_id_fkey(full_name)")
    .eq("company_id", companyId)
    .eq("approver_id", user.id)
    .is("action", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Fetch document details for each approval
  const prIds = data.filter((a) => a.document_type === "pr").map((a) => a.document_id);
  const poIds = data.filter((a) => a.document_type === "po").map((a) => a.document_id);
  const apIds = data.filter((a) => a.document_type === "ap").map((a) => a.document_id);

  const [prDocs, poDocs, apDocs] = await Promise.all([
    prIds.length > 0
      ? supabase.from("purchase_requisitions").select("id, document_number, title, total_amount, department, created_at").in("id", prIds)
      : { data: [] },
    poIds.length > 0
      ? supabase.from("purchase_orders").select("id, document_number, title, net_amount, department, created_at").in("id", poIds)
      : { data: [] },
    apIds.length > 0
      ? supabase.from("ap_vouchers").select("id, document_number, title, net_amount, department, created_at").in("id", apIds)
      : { data: [] },
  ]);

  const docMap: Record<string, { document_number: string; title: string; amount: number; department: string; created_at: string | null }> = {};
  for (const doc of prDocs.data || []) {
    docMap[doc.id] = { document_number: doc.document_number, title: doc.title, amount: Number(doc.total_amount) || 0, department: doc.department, created_at: doc.created_at };
  }
  for (const doc of poDocs.data || []) {
    docMap[doc.id] = { document_number: doc.document_number, title: doc.title, amount: Number(doc.net_amount) || 0, department: doc.department, created_at: doc.created_at };
  }
  for (const doc of apDocs.data || []) {
    docMap[doc.id] = { document_number: doc.document_number, title: doc.title, amount: Number(doc.net_amount) || 0, department: doc.department, created_at: doc.created_at };
  }

  return data.map((approval) => ({
    ...approval,
    document: docMap[approval.document_id] || null,
  }));
}

export async function getDocumentApprovals(
  documentType: "pr" | "po" | "ap",
  documentId: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("approvals")
    .select("*, profiles!approvals_approver_id_fkey(full_name)")
    .eq("document_type", documentType)
    .eq("document_id", documentId)
    .order("step", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createApprovalRequest(
  documentType: "pr" | "po" | "ap",
  documentId: string,
  approverId: string,
  step: number = 1
) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("approvals").insert({
    document_type: documentType,
    document_id: documentId,
    approver_id: approverId,
    step,
    company_id: companyId,
  });

  if (error) throw error;
  revalidatePath("/dashboard/approvals");
  return { success: true };
}

export async function processApproval(
  approvalId: string,
  action: "approve" | "reject" | "revision",
  comment?: string
) {
  await requirePermission("approval.process");
  const supabase = await createClient();

  // Update the approval record
  const { data: approval, error: approvalError } = await supabase
    .from("approvals")
    .update({
      action,
      comment: comment || null,
      acted_at: new Date().toISOString(),
    })
    .eq("id", approvalId)
    .select()
    .single();

  if (approvalError) throw approvalError;

  const table =
    approval.document_type === "pr"
      ? "purchase_requisitions"
      : approval.document_type === "po"
        ? "purchase_orders"
        : "ap_vouchers";

  if (action === "reject" || action === "revision") {
    const newStatus = action === "reject" ? "rejected" : "revision";

    const { error: docError } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq("id", approval.document_id);

    if (docError) throw docError;
  } else {
    // อนุมัติ -> ตรวจสอบว่าทุก step อนุมัติครบหรือยัง
    const { data: allApprovals, error: fetchError } = await supabase
      .from("approvals")
      .select("id, step, action")
      .eq("document_type", approval.document_type)
      .eq("document_id", approval.document_id)
      .order("step", { ascending: true });

    if (fetchError) throw fetchError;

    const allApproved = allApprovals?.every((a) => a.action === "approve");

    if (allApproved) {
      const { error: docError } = await supabase
        .from(table)
        .update({ status: "approved" })
        .eq("id", approval.document_id);

      if (docError) throw docError;
    }
  }

  revalidatePath("/dashboard/approvals");
  revalidatePath(`/dashboard/${approval.document_type}`);
  return { success: true };
}

/**
 * Shared function: ส่งเอกสารเข้าสู่กระบวนการอนุมัติ
 * ใช้ flow-based approval แทน YAML approval-matrix
 */
export async function submitDocumentForApproval(
  documentType: "pr" | "po" | "ap",
  documentId: string,
  tableName: "purchase_requisitions" | "purchase_orders" | "ap_vouchers"
) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  // ดึงยอดรวมจากเอกสาร
  const { data: doc, error: docError } = await supabase
    .from(tableName)
    .select("total_amount, department")
    .eq("id", documentId)
    .single();

  if (docError) throw docError;
  const totalAmount = doc.total_amount || 0;

  // หา applicable flow
  const { getApplicableFlow } = await import("@/lib/actions/flow");
  const flowId = await getApplicableFlow(documentType, totalAmount, doc.department);

  // ลบ approval records เก่า
  await supabase
    .from("approvals")
    .delete()
    .eq("document_type", documentType)
    .eq("document_id", documentId);

  let approvalRecords: Array<{
    document_type: "pr" | "po" | "ap";
    document_id: string;
    approver_id: string;
    step: number;
    company_id: string;
  }> = [];

  if (flowId) {
    // ตรวจสอบว่า flow มี auto_escalate หรือไม่
    const { data: flowData } = await supabase
      .from("approval_flows")
      .select("auto_escalate")
      .eq("id", flowId)
      .single();

    if (flowData?.auto_escalate) {
      // Auto-escalate: สร้าง chain อัตโนมัติตาม org_level
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { resolveAutoEscalateChain } = await import(
          "@/lib/utils/flow-resolver"
        );
        const chain = await resolveAutoEscalateChain(
          companyId,
          user.id,
          totalAmount
        );

        approvalRecords = chain.map((step) => ({
          document_type: documentType,
          document_id: documentId,
          approver_id: step.userId,
          step: step.step,
          company_id: companyId,
        }));
      }
    } else {
      // ใช้ flow resolver ปกติ (pass companyId สำหรับ org_level lookup)
      const { resolveApprovalChain } = await import(
        "@/lib/utils/flow-resolver"
      );
      const chain = await resolveApprovalChain(flowId, {
        total_amount: totalAmount,
        department: doc.department,
      }, companyId);

      approvalRecords = chain.map((step) => ({
        document_type: documentType,
        document_id: documentId,
        approver_id: step.userId,
        step: step.step,
        company_id: companyId,
      }));
    }
  }

  // Fallback: ถ้าไม่มี flow หรือ chain ว่าง → ใช้ company_members.org_level
  if (approvalRecords.length === 0) {
    const { data: fallbackUser } = await supabase
      .from("company_members")
      .select("user_id")
      .eq("company_id", companyId)
      .not("org_level", "is", null)
      .order("org_level", { ascending: false })
      .limit(1);

    if (fallbackUser?.[0]) {
      approvalRecords.push({
        document_type: documentType,
        document_id: documentId,
        approver_id: fallbackUser[0].user_id,
        step: 1,
        company_id: companyId,
      });
    }
  }

  if (approvalRecords.length > 0) {
    const { error: approvalError } = await supabase
      .from("approvals")
      .insert(approvalRecords);

    if (approvalError) throw approvalError;
  }

  // อัพเดทสถานะเอกสาร
  const { error } = await supabase
    .from(tableName)
    .update({ status: "pending_approval" })
    .eq("id", documentId);

  if (error) throw error;
  revalidatePath(`/dashboard/${documentType}`);
  revalidatePath("/dashboard/approvals");
  return { success: true };
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const companyId = await getActiveCompanyId();

  const [prResult, poResult, apResult, pendingApprovalsResult] =
    await Promise.all([
      supabase
        .from("purchase_requisitions")
        .select("status", { count: "exact" })
        .eq("company_id", companyId),
      supabase
        .from("purchase_orders")
        .select("status", { count: "exact" })
        .eq("company_id", companyId),
      supabase
        .from("ap_vouchers")
        .select("status, payment_status", { count: "exact" })
        .eq("company_id", companyId),
      supabase
        .from("approvals")
        .select("id", { count: "exact" })
        .eq("company_id", companyId)
        .eq("approver_id", user.id)
        .is("action", null),
    ]);

  const prData = prResult.data || [];
  const poData = poResult.data || [];
  const apData = apResult.data || [];

  return {
    pr: {
      total: prData.length,
      draft: prData.filter((r) => r.status === "draft").length,
      pending: prData.filter((r) => r.status === "pending_approval").length,
      approved: prData.filter((r) => r.status === "approved").length,
    },
    po: {
      total: poData.length,
      draft: poData.filter((r) => r.status === "draft").length,
      pending: poData.filter((r) => r.status === "pending_approval").length,
      approved: poData.filter((r) => r.status === "approved").length,
    },
    ap: {
      total: apData.length,
      draft: apData.filter((r) => r.status === "draft").length,
      pending: apData.filter((r) => r.status === "pending_approval").length,
      unpaid: apData.filter((r) => r.payment_status === "unpaid").length,
      paid: apData.filter((r) => r.payment_status === "paid").length,
    },
    pendingApprovals: pendingApprovalsResult.count || 0,
  };
}
