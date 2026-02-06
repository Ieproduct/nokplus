import { StartNode } from "./start-node";
import { ApproverNode } from "./approver-node";
import { ConditionNode } from "./condition-node";
import { EndNode } from "./end-node";

export const nodeTypes = {
  start: StartNode,
  approver: ApproverNode,
  condition: ConditionNode,
  end: EndNode,
};
