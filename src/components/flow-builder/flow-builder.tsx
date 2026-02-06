"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./node-types";
import { saveFlowDesign } from "@/lib/actions/flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Save, Plus } from "lucide-react";
import { toast } from "sonner";

interface FlowBuilderProps {
  flowId: string;
  flowName: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

export function FlowBuilder({
  flowId,
  flowName,
  initialNodes,
  initialEdges,
}: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [saving, setSaving] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [newNodeType, setNewNodeType] = useState<string>("approver");
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeLevel, setNewNodeLevel] = useState("");
  const [newNodeMaxAmount, setNewNodeMaxAmount] = useState("");
  const [newConditionField, setNewConditionField] = useState("total_amount");
  const [newConditionOp, setNewConditionOp] = useState(">");
  const [newConditionValue, setNewConditionValue] = useState("");

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  async function handleSave() {
    setSaving(true);
    try {
      const nodeData = nodes.map((n) => ({
        id: n.id,
        node_type: n.type as "start" | "approver" | "condition" | "end",
        user_id: (n.data as Record<string, unknown>).user_id as string | null || null,
        label: (n.data as Record<string, unknown>).label as string || "",
        position_x: n.position.x,
        position_y: n.position.y,
        config: (n.data as Record<string, unknown>).config as Record<string, unknown> || {},
      }));

      const edgeData = edges.map((e) => ({
        source_node_id: e.source,
        target_node_id: e.target,
        label: e.label as string || null,
        condition: (e.data as Record<string, unknown>) || {},
      }));

      await saveFlowDesign(flowId, nodeData, edgeData);
      toast.success("บันทึก Flow เรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  function handleAddNode() {
    const id = `node_${Date.now()}`;
    const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0);

    let data: Record<string, unknown> = { label: newNodeLabel };

    if (newNodeType === "approver") {
      data.config = {
        approval_level: newNodeLevel ? parseInt(newNodeLevel) : undefined,
        max_amount: newNodeMaxAmount ? parseInt(newNodeMaxAmount) : null,
      };
    } else if (newNodeType === "condition") {
      data.config = {
        field: newConditionField,
        operator: newConditionOp,
        value: newConditionValue ? parseInt(newConditionValue) : 0,
      };
    }

    const newNode: Node = {
      id,
      type: newNodeType,
      position: { x: 250, y: maxY + 120 },
      data,
    };

    setNodes((nds) => [...nds, newNode]);
    setAddNodeOpen(false);
    setNewNodeLabel("");
    setNewNodeLevel("");
    setNewNodeMaxAmount("");
    setNewConditionValue("");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{flowName}</h1>
          <p className="text-sm text-muted-foreground">ลากเส้นเชื่อม node เพื่อสร้างลำดับการอนุมัติ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddNodeOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่ม Node
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-lg border bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>

      <Dialog open={addNodeOpen} onOpenChange={setAddNodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ประเภท</Label>
              <Select value={newNodeType} onValueChange={setNewNodeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approver">ผู้อนุมัติ</SelectItem>
                  <SelectItem value="condition">เงื่อนไข</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ชื่อ</Label>
              <Input value={newNodeLabel} onChange={(e) => setNewNodeLabel(e.target.value)} placeholder="เช่น ผู้จัดการ, วงเงิน > 50,000" />
            </div>

            {newNodeType === "approver" && (
              <>
                <div>
                  <Label>Approval Level</Label>
                  <Input type="number" value={newNodeLevel} onChange={(e) => setNewNodeLevel(e.target.value)} placeholder="1, 2, 3..." />
                </div>
                <div>
                  <Label>วงเงินสูงสุด (บาท)</Label>
                  <Input type="number" value={newNodeMaxAmount} onChange={(e) => setNewNodeMaxAmount(e.target.value)} placeholder="ว่างไว้ = ไม่จำกัด" />
                </div>
              </>
            )}

            {newNodeType === "condition" && (
              <>
                <div>
                  <Label>เงื่อนไข</Label>
                  <div className="flex gap-2">
                    <Select value={newConditionField} onValueChange={setNewConditionField}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total_amount">ยอดรวม</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newConditionOp} onValueChange={setNewConditionOp}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">&gt;</SelectItem>
                        <SelectItem value=">=">&gt;=</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value="<=">&lt;=</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" value={newConditionValue} onChange={(e) => setNewConditionValue(e.target.value)} placeholder="จำนวน" />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddNodeOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleAddNode} disabled={!newNodeLabel}>เพิ่ม</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
