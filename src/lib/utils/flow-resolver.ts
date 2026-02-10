import { createClient } from "@/lib/supabase/server";

interface FlowNode {
  id: string;
  flow_id: string;
  node_type: "start" | "approver" | "condition" | "end";
  user_id: string | null;
  label: string;
  config: Record<string, unknown>;
}

interface FlowEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  label: string | null;
  condition: Record<string, unknown>;
}

interface DocumentContext {
  total_amount: number;
  department?: string;
}

export interface ApprovalChainStep {
  step: number;
  userId: string;
  label: string;
}

/**
 * BFS จาก start node → end node ผ่าน flow graph
 * Evaluate condition nodes เพื่อเลือก edge ที่ถูกต้อง
 * Return ordered approval chain
 */
export async function resolveApprovalChain(
  flowId: string,
  context: DocumentContext,
  companyId?: string
): Promise<ApprovalChainStep[]> {
  const supabase = await createClient();

  const [nodesResult, edgesResult] = await Promise.all([
    supabase
      .from("approval_flow_nodes")
      .select("*")
      .eq("flow_id", flowId),
    supabase
      .from("approval_flow_edges")
      .select("*")
      .eq("flow_id", flowId),
  ]);

  if (nodesResult.error) throw nodesResult.error;
  if (edgesResult.error) throw edgesResult.error;

  const nodes = nodesResult.data as FlowNode[];
  const edges = edgesResult.data as FlowEdge[];

  // หา start node
  const startNode = nodes.find((n) => n.node_type === "start");
  if (!startNode) return [];

  // สร้าง adjacency map
  const edgesBySource = new Map<string, FlowEdge[]>();
  for (const edge of edges) {
    const existing = edgesBySource.get(edge.source_node_id) || [];
    existing.push(edge);
    edgesBySource.set(edge.source_node_id, existing);
  }

  const nodeById = new Map<string, FlowNode>();
  for (const node of nodes) {
    nodeById.set(node.id, node);
  }

  // BFS/DFS traverse
  const chain: ApprovalChainStep[] = [];
  let currentNodeId: string | null = startNode.id;
  const visited = new Set<string>();

  while (currentNodeId && !visited.has(currentNodeId)) {
    visited.add(currentNodeId);
    const node = nodeById.get(currentNodeId);
    if (!node) break;

    if (node.node_type === "end") break;

    if (node.node_type === "approver") {
      // หา user_id จาก node หรือจาก approval_level ใน config
      let userId = node.user_id;

      if (!userId && node.config?.approval_level) {
        const level = node.config.approval_level as number;

        if (companyId) {
          // ใช้ company_members.org_level (multi-company)
          const { data: approver } = await supabase
            .from("company_members")
            .select("user_id")
            .eq("company_id", companyId)
            .eq("org_level", level)
            .limit(1)
            .single();

          userId = approver?.user_id || null;
        } else {
          // Fallback: ใช้ profiles.approval_level (legacy)
          const { data: approver } = await supabase
            .from("profiles")
            .select("id")
            .eq("approval_level", level)
            .eq("is_active", true)
            .limit(1)
            .single();

          userId = approver?.id || null;
        }
      }

      if (userId) {
        chain.push({
          step: chain.length + 1,
          userId,
          label: node.label,
        });
      }
    }

    // หา edge ถัดไป
    const outEdges: FlowEdge[] = edgesBySource.get(currentNodeId) || [];

    if (node.node_type === "condition") {
      // Evaluate condition เพื่อเลือก edge
      const result = evaluateCondition(node.config, context);

      // หา edge ที่ตรงกับผลลัพธ์
      const matchedEdge = outEdges.find((e) => {
        const cond = e.condition as Record<string, unknown>;
        return cond.result === result;
      });

      currentNodeId = matchedEdge?.target_node_id || null;

      // ถ้าไม่มี edge ที่ตรง ใช้ edge แรก
      if (!currentNodeId && outEdges.length > 0) {
        currentNodeId = outEdges[0].target_node_id;
      }
    } else {
      // Non-condition nodes: ใช้ edge แรก
      currentNodeId = outEdges.length > 0 ? outEdges[0].target_node_id : null;
    }
  }

  return chain;
}

/**
 * Auto-escalate: สร้าง approval chain อัตโนมัติจาก org_level ของ submitter ขึ้นไป
 * หาผู้อนุมัติที่ level สูงกว่า submitter จนเจอคนที่ max_approval_amount >= totalAmount
 */
export async function resolveAutoEscalateChain(
  companyId: string,
  submitterUserId: string,
  totalAmount: number
): Promise<ApprovalChainStep[]> {
  const supabase = await createClient();

  // หา submitter's org_level
  const { data: submitter } = await supabase
    .from("company_members")
    .select("org_level")
    .eq("company_id", companyId)
    .eq("user_id", submitterUserId)
    .single();

  const submitterLevel = submitter?.org_level || 1;

  // ดึงสมาชิกที่ org_level > submitterLevel เรียงจากต่ำไปสูง
  const { data: candidates, error } = await supabase
    .from("company_members")
    .select("user_id, org_level, max_approval_amount, profiles(full_name)")
    .eq("company_id", companyId)
    .gt("org_level", submitterLevel)
    .order("org_level", { ascending: true });

  if (error) throw error;
  if (!candidates || candidates.length === 0) return [];

  // สร้าง chain: เพิ่มแต่ละ level จนเจอคนที่ max_approval_amount >= totalAmount
  const chain: ApprovalChainStep[] = [];
  const seenLevels = new Set<number>();

  for (const c of candidates) {
    if (!c.org_level || seenLevels.has(c.org_level)) continue;
    seenLevels.add(c.org_level);

    const profileData = c.profiles as unknown as { full_name: string } | null;

    chain.push({
      step: chain.length + 1,
      userId: c.user_id,
      label: profileData?.full_name || `Level ${c.org_level}`,
    });

    // ถ้า max_approval_amount = null → unlimited (จบ chain)
    // ถ้า max_approval_amount >= totalAmount → จบ chain
    const maxAmount = c.max_approval_amount ? Number(c.max_approval_amount) : null;
    if (maxAmount === null || maxAmount >= totalAmount) {
      break;
    }
  }

  return chain;
}

function evaluateCondition(
  config: Record<string, unknown>,
  context: DocumentContext
): boolean {
  const field = config.field as string;
  const operator = config.operator as string;
  const value = config.value as number;

  if (!field || !operator || value === undefined) return true;

  let fieldValue: number;
  if (field === "total_amount") {
    fieldValue = context.total_amount;
  } else {
    return true;
  }

  switch (operator) {
    case ">":
      return fieldValue > value;
    case ">=":
      return fieldValue >= value;
    case "<":
      return fieldValue < value;
    case "<=":
      return fieldValue <= value;
    case "==":
      return fieldValue === value;
    default:
      return true;
  }
}
