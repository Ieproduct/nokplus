import { getApprovalFlow } from "@/lib/actions/flow";
import { getCompanyMembers } from "@/lib/actions/company";
import { FlowBuilder } from "@/components/flow-builder/flow-builder";
import { notFound } from "next/navigation";
import type { Node, Edge } from "@xyflow/react";

export default async function FlowBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let flowData;
  try {
    flowData = await getApprovalFlow(id);
  } catch {
    notFound();
  }

  // Fetch company members for user selection
  const members = await getCompanyMembers();
  const users = members.map((m) => ({
    id: m.user_id,
    full_name: (m as Record<string, unknown>).profiles
      ? ((m as Record<string, unknown>).profiles as Record<string, unknown>)
          .full_name as string
      : "",
    email: (m as Record<string, unknown>).profiles
      ? ((m as Record<string, unknown>).profiles as Record<string, unknown>)
          .email as string
      : "",
    position: (m as Record<string, unknown>).profiles
      ? ((m as Record<string, unknown>).profiles as Record<string, unknown>)
          .position as string
      : "",
  }));

  // Convert DB nodes/edges to React Flow format
  const initialNodes: Node[] = flowData.nodes.map((n) => ({
    id: n.id,
    type: n.node_type,
    position: { x: n.position_x, y: n.position_y },
    data: {
      label: n.label,
      user_id: n.user_id,
      config: n.config,
    },
  }));

  const initialEdges: Edge[] = flowData.edges.map((e) => ({
    id: e.id,
    source: e.source_node_id,
    target: e.target_node_id,
    label: e.label || undefined,
    data: (e.condition as Record<string, unknown>) || undefined,
    animated: true,
    style: { stroke: "#94a3b8" },
  }));

  return (
    <FlowBuilder
      flowId={id}
      flowName={flowData.flow.name}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      users={users}
    />
  );
}
