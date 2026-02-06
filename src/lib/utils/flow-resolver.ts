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
  context: DocumentContext
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
        // หา user จาก profiles โดย approval_level
        const { data: approver } = await supabase
          .from("profiles")
          .select("id")
          .eq("approval_level", node.config.approval_level as number)
          .eq("is_active", true)
          .limit(1)
          .single();

        userId = approver?.id || null;
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
