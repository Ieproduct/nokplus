"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";

export async function getApprovalFlows() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data, error } = await supabase
    .from("approval_flows")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("document_type")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getApprovalFlow(flowId: string) {
  const supabase = await createClient();

  const { data: flow, error: flowError } = await supabase
    .from("approval_flows")
    .select("*")
    .eq("id", flowId)
    .single();

  if (flowError) throw flowError;

  const { data: nodes, error: nodesError } = await supabase
    .from("approval_flow_nodes")
    .select("*")
    .eq("flow_id", flowId)
    .order("position_y");

  if (nodesError) throw nodesError;

  const { data: edges, error: edgesError } = await supabase
    .from("approval_flow_edges")
    .select("*")
    .eq("flow_id", flowId);

  if (edgesError) throw edgesError;

  return { flow, nodes, edges };
}

export async function createApprovalFlow(input: {
  name: string;
  document_type: "pr" | "po" | "ap";
  is_default?: boolean;
  auto_escalate?: boolean;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  // ถ้าตั้งเป็น default ให้ unset default ตัวเดิม
  if (input.is_default) {
    await supabase
      .from("approval_flows")
      .update({ is_default: false })
      .eq("company_id", companyId)
      .eq("document_type", input.document_type)
      .eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("approval_flows")
    .insert({
      company_id: companyId,
      name: input.name,
      document_type: input.document_type,
      is_default: input.is_default ?? false,
      auto_escalate: input.auto_escalate ?? false,
    })
    .select()
    .single();

  if (error) throw error;

  // สร้าง start + end nodes เริ่มต้น
  await supabase.from("approval_flow_nodes").insert([
    {
      flow_id: data.id,
      node_type: "start" as const,
      label: "เริ่มต้น",
      position_x: 250,
      position_y: 0,
    },
    {
      flow_id: data.id,
      node_type: "end" as const,
      label: "อนุมัติ",
      position_x: 250,
      position_y: 200,
    },
  ]);

  revalidatePath("/dashboard/settings");
  return { success: true, id: data.id };
}

export async function updateApprovalFlow(
  flowId: string,
  input: { name?: string; is_default?: boolean; is_active?: boolean; auto_escalate?: boolean }
) {
  const supabase = await createClient();

  if (input.is_default) {
    const { data: flow } = await supabase
      .from("approval_flows")
      .select("company_id, document_type")
      .eq("id", flowId)
      .single();

    if (flow) {
      await supabase
        .from("approval_flows")
        .update({ is_default: false })
        .eq("company_id", flow.company_id)
        .eq("document_type", flow.document_type)
        .eq("is_default", true);
    }
  }

  const { error } = await supabase
    .from("approval_flows")
    .update(input)
    .eq("id", flowId);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteApprovalFlow(flowId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("approval_flows")
    .update({ is_active: false })
    .eq("id", flowId);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function saveFlowDesign(
  flowId: string,
  nodes: Array<{
    id?: string;
    node_type: "start" | "approver" | "condition" | "end";
    user_id?: string | null;
    label: string;
    position_x: number;
    position_y: number;
    config?: Record<string, unknown>;
  }>,
  edges: Array<{
    source_node_id: string;
    target_node_id: string;
    label?: string | null;
    condition?: Record<string, unknown> | null;
  }>
) {
  const supabase = await createClient();

  // Delete existing nodes & edges (cascade deletes edges)
  await supabase.from("approval_flow_edges").delete().eq("flow_id", flowId);
  await supabase.from("approval_flow_nodes").delete().eq("flow_id", flowId);

  // Insert new nodes
  const nodeInserts = nodes.map((n) => ({
    id: n.id || undefined,
    flow_id: flowId,
    node_type: n.node_type,
    user_id: n.user_id || null,
    label: n.label,
    position_x: n.position_x,
    position_y: n.position_y,
    config: (n.config || {}) as import("@/lib/types/database").Json,
  }));

  const { data: insertedNodes, error: nodesError } = await supabase
    .from("approval_flow_nodes")
    .insert(nodeInserts)
    .select();

  if (nodesError) throw nodesError;

  // Map old node IDs to new node IDs
  const idMap = new Map<string, string>();
  nodes.forEach((n, i) => {
    if (n.id && insertedNodes[i]) {
      idMap.set(n.id, insertedNodes[i].id);
    }
  });

  // Insert edges with mapped IDs
  if (edges.length > 0) {
    const edgeInserts = edges.map((e) => ({
      flow_id: flowId,
      source_node_id: idMap.get(e.source_node_id) || e.source_node_id,
      target_node_id: idMap.get(e.target_node_id) || e.target_node_id,
      label: e.label || null,
      condition: (e.condition || {}) as import("@/lib/types/database").Json,
    }));

    const { error: edgesError } = await supabase
      .from("approval_flow_edges")
      .insert(edgeInserts);

    if (edgesError) throw edgesError;
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getApplicableFlow(
  documentType: "pr" | "po" | "ap",
  totalAmount?: number,
  _department?: string
) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  // 1) ถ้ามี totalAmount → หา tier flow ที่ตรงกับวงเงิน
  if (totalAmount != null && totalAmount > 0) {
    const { data: tierFlow } = await supabase
      .from("approval_flows")
      .select("id")
      .eq("company_id", companyId)
      .eq("document_type", documentType)
      .eq("is_active", true)
      .not("min_amount", "is", null)
      .lte("min_amount", totalAmount)
      .gte("max_amount", totalAmount)
      .limit(1)
      .single();

    if (tierFlow) return tierFlow.id;
  }

  // 2) Fallback: หา default flow สำหรับ document type นี้
  const { data, error } = await supabase
    .from("approval_flows")
    .select("id")
    .eq("company_id", companyId)
    .eq("document_type", documentType)
    .eq("is_default", true)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (error || !data) {
    // Fallback: หา flow ใดก็ได้ที่ active
    const { data: fallback } = await supabase
      .from("approval_flows")
      .select("id")
      .eq("company_id", companyId)
      .eq("document_type", documentType)
      .eq("is_active", true)
      .is("min_amount", null)
      .limit(1)
      .single();

    if (!fallback) return null;
    return fallback.id;
  }

  return data.id;
}

// ============ Tier CRUD ============

export interface ApprovalTier {
  id: string;
  name: string;
  document_type: string;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  approvers: Array<{
    node_id: string;
    user_id: string;
    label: string;
    step: number;
  }>;
}

export async function getApprovalTiers(): Promise<ApprovalTier[]> {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  const { data: flows, error } = await supabase
    .from("approval_flows")
    .select("id, name, document_type, min_amount, max_amount, is_active")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .not("min_amount", "is", null)
    .order("document_type")
    .order("min_amount");

  if (error) throw error;
  if (!flows || flows.length === 0) return [];

  // ดึง approver nodes สำหรับแต่ละ flow
  const flowIds = flows.map((f) => f.id);
  const { data: nodes, error: nodesError } = await supabase
    .from("approval_flow_nodes")
    .select("id, flow_id, user_id, label, position_y")
    .in("flow_id", flowIds)
    .eq("node_type", "approver")
    .order("position_y");

  if (nodesError) throw nodesError;

  const nodesByFlow = new Map<string, typeof nodes>();
  for (const node of nodes || []) {
    const list = nodesByFlow.get(node.flow_id) || [];
    list.push(node);
    nodesByFlow.set(node.flow_id, list);
  }

  return flows.map((f, _i) => {
    const flowNodes = nodesByFlow.get(f.id) || [];
    return {
      id: f.id,
      name: f.name,
      document_type: f.document_type,
      min_amount: Number(f.min_amount),
      max_amount: Number(f.max_amount),
      is_active: f.is_active,
      approvers: flowNodes.map((n, idx) => ({
        node_id: n.id,
        user_id: n.user_id!,
        label: n.label,
        step: idx + 1,
      })),
    };
  });
}

export async function createApprovalTier(input: {
  document_type: "pr" | "po" | "ap";
  min_amount: number;
  max_amount: number;
  approvers: Array<{ user_id: string; label: string }>;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();

  // สร้าง flow
  const name = `วงเงิน ${input.min_amount.toLocaleString()}-${input.max_amount.toLocaleString()}`;
  const { data: flow, error: flowError } = await supabase
    .from("approval_flows")
    .insert({
      company_id: companyId,
      name,
      document_type: input.document_type,
      is_default: false,
      min_amount: input.min_amount,
      max_amount: input.max_amount,
    })
    .select()
    .single();

  if (flowError) throw flowError;

  // สร้าง nodes: start → approver1 → approver2 → ... → end
  const allNodes = [
    { flow_id: flow.id, node_type: "start" as const, label: "เริ่มต้น", position_x: 250, position_y: 0, user_id: null },
    ...input.approvers.map((a, i) => ({
      flow_id: flow.id,
      node_type: "approver" as const,
      label: a.label,
      position_x: 250,
      position_y: (i + 1) * 150,
      user_id: a.user_id,
    })),
    { flow_id: flow.id, node_type: "end" as const, label: "อนุมัติ", position_x: 250, position_y: (input.approvers.length + 1) * 150, user_id: null },
  ];

  const { data: insertedNodes, error: nodesError } = await supabase
    .from("approval_flow_nodes")
    .insert(allNodes)
    .select();

  if (nodesError) throw nodesError;

  // สร้าง edges: chain sequential
  const edges = [];
  for (let i = 0; i < insertedNodes.length - 1; i++) {
    edges.push({
      flow_id: flow.id,
      source_node_id: insertedNodes[i].id,
      target_node_id: insertedNodes[i + 1].id,
    });
  }

  if (edges.length > 0) {
    const { error: edgesError } = await supabase
      .from("approval_flow_edges")
      .insert(edges);
    if (edgesError) throw edgesError;
  }

  revalidatePath("/dashboard/settings");
  return { success: true, id: flow.id };
}

export async function updateApprovalTier(
  flowId: string,
  input: {
    min_amount: number;
    max_amount: number;
    approvers: Array<{ user_id: string; label: string }>;
  }
) {
  const supabase = await createClient();

  // อัพเดท flow amount
  const name = `วงเงิน ${input.min_amount.toLocaleString()}-${input.max_amount.toLocaleString()}`;
  const { error: flowError } = await supabase
    .from("approval_flows")
    .update({ min_amount: input.min_amount, max_amount: input.max_amount, name })
    .eq("id", flowId);

  if (flowError) throw flowError;

  // ลบ nodes/edges เก่า แล้วสร้างใหม่
  await supabase.from("approval_flow_edges").delete().eq("flow_id", flowId);
  await supabase.from("approval_flow_nodes").delete().eq("flow_id", flowId);

  const allNodes = [
    { flow_id: flowId, node_type: "start" as const, label: "เริ่มต้น", position_x: 250, position_y: 0, user_id: null },
    ...input.approvers.map((a, i) => ({
      flow_id: flowId,
      node_type: "approver" as const,
      label: a.label,
      position_x: 250,
      position_y: (i + 1) * 150,
      user_id: a.user_id,
    })),
    { flow_id: flowId, node_type: "end" as const, label: "อนุมัติ", position_x: 250, position_y: (input.approvers.length + 1) * 150, user_id: null },
  ];

  const { data: insertedNodes, error: nodesError } = await supabase
    .from("approval_flow_nodes")
    .insert(allNodes)
    .select();

  if (nodesError) throw nodesError;

  const edges = [];
  for (let i = 0; i < insertedNodes.length - 1; i++) {
    edges.push({
      flow_id: flowId,
      source_node_id: insertedNodes[i].id,
      target_node_id: insertedNodes[i + 1].id,
    });
  }

  if (edges.length > 0) {
    const { error: edgesError } = await supabase
      .from("approval_flow_edges")
      .insert(edges);
    if (edgesError) throw edgesError;
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteApprovalTier(flowId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("approval_flows")
    .update({ is_active: false })
    .eq("id", flowId);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  return { success: true };
}
