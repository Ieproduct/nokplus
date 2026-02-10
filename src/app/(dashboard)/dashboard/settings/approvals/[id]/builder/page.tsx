import { getApprovalFlow } from "@/lib/actions/flow";
import { getCompanyMembers } from "@/lib/actions/company";
import { getOrganizationLevels } from "@/lib/actions/organization";
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

  // Fetch company members and org levels in parallel
  const [members, orgLevels] = await Promise.all([
    getCompanyMembers(),
    getOrganizationLevels(),
  ]);

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

  // Build level label map for node display
  const levelLabelMap: Record<number, string> = {};
  for (const l of orgLevels) {
    levelLabelMap[l.level] = `L${l.level}: ${l.label_th}`;
  }

  // Convert DB nodes/edges to React Flow format
  const initialNodes: Node[] = flowData.nodes.map((n) => {
    const config = (n.config || {}) as Record<string, unknown>;
    const approvalLevel = config.approval_level as number | undefined;

    return {
      id: n.id,
      type: n.node_type,
      position: { x: n.position_x, y: n.position_y },
      data: {
        label: n.label,
        user_id: n.user_id,
        config: n.config,
        org_level_label: approvalLevel ? levelLabelMap[approvalLevel] : undefined,
      },
    };
  });

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
      orgLevels={orgLevels.map((l) => ({ level: l.level, label_th: l.label_th }))}
    />
  );
}
