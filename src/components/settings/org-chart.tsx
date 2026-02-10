"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { DragDropProvider, useDraggable, useDroppable, useDragOperation } from "@dnd-kit/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, ChevronDown, Users, AlertCircle, Building2, Filter, GripVertical, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { updateMemberOrgLevel } from "@/lib/actions/organization";

interface CompanyInfo {
  id: string;
  name_th: string;
  name_en: string | null;
}

interface DepartmentInfo {
  id: string;
  code: string;
  name: string;
  company_id: string;
}

interface MemberWithProfile {
  id: string;
  user_id: string;
  company_id: string;
  department_id: string | null;
  role: string;
  org_level: number | null;
  max_approval_amount: number | null;
  reports_to_member_id: string | null;
  profiles: {
    full_name: string;
    email: string;
    position: string | null;
    department: string | null;
  } | null;
  companies: {
    name_th: string;
    name_en: string | null;
  } | null;
  departments: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface TreeNode {
  member: MemberWithProfile;
  children: TreeNode[];
}

function buildTree(members: MemberWithProfile[]): { roots: TreeNode[]; orphans: MemberWithProfile[] } {
  const memberMap = new Map<string, MemberWithProfile>();
  const childrenMap = new Map<string, MemberWithProfile[]>();

  for (const m of members) {
    memberMap.set(m.id, m);
  }

  // Build children map
  for (const m of members) {
    if (m.reports_to_member_id && memberMap.has(m.reports_to_member_id)) {
      const existing = childrenMap.get(m.reports_to_member_id) || [];
      existing.push(m);
      childrenMap.set(m.reports_to_member_id, existing);
    }
  }

  // Find root nodes (reports_to = null) and orphans
  const rootMembers: MemberWithProfile[] = [];
  const orphans: MemberWithProfile[] = [];

  for (const m of members) {
    if (!m.reports_to_member_id) {
      // Check if this member has subordinates or has org_level (is meaningful as root)
      const hasChildren = childrenMap.has(m.id);
      if (hasChildren || m.org_level) {
        rootMembers.push(m);
      } else {
        orphans.push(m);
      }
    } else if (!memberMap.has(m.reports_to_member_id)) {
      // reports_to points to non-existent member in filtered set → treat as root if meaningful
      const hasChildren = childrenMap.has(m.id);
      if (hasChildren || m.org_level) {
        rootMembers.push(m);
      } else {
        orphans.push(m);
      }
    }
  }

  // Sort roots by org_level descending (highest level first)
  rootMembers.sort((a, b) => (b.org_level || 0) - (a.org_level || 0));

  function buildNode(member: MemberWithProfile): TreeNode {
    const children = (childrenMap.get(member.id) || [])
      .sort((a, b) => (b.org_level || 0) - (a.org_level || 0));
    return {
      member,
      children: children.map(buildNode),
    };
  }

  return {
    roots: rootMembers.map(buildNode),
    orphans,
  };
}

function countDescendants(node: TreeNode): number {
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

function getDescendantIds(memberId: string, members: MemberWithProfile[]): Set<string> {
  const descendants = new Set<string>();
  const stack = [memberId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const m of members) {
      if (m.reports_to_member_id === current && !descendants.has(m.id)) {
        descendants.add(m.id);
        stack.push(m.id);
      }
    }
  }
  return descendants;
}

export function OrgChart({
  members,
  companies,
  departments,
}: {
  members: MemberWithProfile[];
  companies: CompanyInfo[];
  departments: DepartmentInfo[];
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [localMembers, setLocalMembers] = useState(members);

  useEffect(() => setLocalMembers(members), [members]);

  // Departments scoped to selected company
  const visibleDepartments = useMemo(() => {
    if (!selectedCompanyId) return departments;
    return departments.filter((d) => d.company_id === selectedCompanyId);
  }, [departments, selectedCompanyId]);

  // Reset department filter when company changes
  const handleCompanyChange = (companyId: string | null) => {
    setSelectedCompanyId(companyId);
    setSelectedDepartmentId(null);
  };

  // Filter members using localMembers for optimistic updates
  const filteredMembers = useMemo(() => {
    let result = localMembers;
    if (selectedCompanyId) {
      result = result.filter((m) => m.company_id === selectedCompanyId);
    }
    if (selectedDepartmentId) {
      result = result.filter((m) => m.department_id === selectedDepartmentId);
    }
    return result;
  }, [localMembers, selectedCompanyId, selectedDepartmentId]);

  const { roots, orphans } = buildTree(filteredMembers);
  const showCompanyBadge = !selectedCompanyId && companies.length > 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = useCallback((event: any) => {
    const { operation, canceled } = event;
    if (canceled) return;

    const source = operation.source;
    const target = operation.target;
    if (!source || !target) return;

    const draggedMemberId = source.data?.memberId as string | undefined;
    const targetId = target.id as string;
    if (!draggedMemberId) return;

    const isOrphanZone = targetId === "orphan-zone";
    const newManagerId = isOrphanZone ? null : (target.data?.memberId as string | undefined) ?? null;

    // Self-drop check
    if (newManagerId === draggedMemberId) return;

    // Same manager check
    const currentMember = localMembers.find((m) => m.id === draggedMemberId);
    if (!currentMember) return;
    if (currentMember.reports_to_member_id === newManagerId) return;

    // Circular ref check (client-side)
    if (newManagerId) {
      const descendants = getDescendantIds(draggedMemberId, localMembers);
      if (descendants.has(newManagerId)) {
        toast.error("ไม่สามารถรายงานตรงต่อผู้ใต้บังคับบัญชาได้ (วงจร)");
        return;
      }
    }

    // Optimistic update
    const prevMembers = [...localMembers];
    setLocalMembers((prev) =>
      prev.map((m) => (m.id === draggedMemberId ? { ...m, reports_to_member_id: newManagerId } : m))
    );

    const targetName = newManagerId
      ? localMembers.find((m) => m.id === newManagerId)?.profiles?.full_name || "ไม่ทราบ"
      : null;

    toast.success(
      isOrphanZone
        ? `ยกเลิกหัวหน้าของ ${currentMember.profiles?.full_name || "-"}`
        : `ย้าย ${currentMember.profiles?.full_name || "-"} ไปอยู่ใต้ ${targetName}`
    );

    // Server action
    updateMemberOrgLevel(draggedMemberId, {
      org_level: currentMember.org_level,
      max_approval_amount: currentMember.max_approval_amount,
      reports_to_member_id: newManagerId,
    }).then((result) => {
      if (!result.success) {
        setLocalMembers(prevMembers);
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    });
  }, [localMembers]);

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">แผนผังองค์กร</h3>
          <p className="text-center text-muted-foreground py-8">ยังไม่มีสมาชิก</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">แผนผังองค์กร (สายบังคับบัญชา)</h3>

        {/* Filter bar */}
        {(companies.length > 1 || departments.length > 0) && (
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

            {/* Company filter */}
            {companies.length > 1 && (
              <Select
                value={selectedCompanyId ?? "__all__"}
                onValueChange={(v) => handleCompanyChange(v === "__all__" ? null : v)}
              >
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="เลือกบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">ทุกบริษัท</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Department filter */}
            {visibleDepartments.length > 0 && (
              <Select
                value={selectedDepartmentId ?? "__all__"}
                onValueChange={(v) => setSelectedDepartmentId(v === "__all__" ? null : v)}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="เลือกแผนก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">ทุกแผนก</SelectItem>
                  {visibleDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <DragDropProvider onDragEnd={handleDragEnd}>
          <OrgChartTree roots={roots} orphans={orphans} showCompanyBadge={showCompanyBadge} />
        </DragDropProvider>

        {filteredMembers.length === 0 && members.length > 0 && (
          <p className="text-center text-muted-foreground py-8">ไม่มีสมาชิกที่ตรงกับตัวกรอง</p>
        )}
      </CardContent>
    </Card>
  );
}

function OrgChartTree({
  roots,
  orphans,
  showCompanyBadge,
}: {
  roots: TreeNode[];
  orphans: MemberWithProfile[];
  showCompanyBadge: boolean;
}) {
  const { source } = useDragOperation();
  const isDragActive = !!source;

  return (
    <>
      <div className="space-y-0.5">
        {roots.map((node) => (
          <TreeNodeRow key={node.member.id} node={node} depth={0} showCompanyBadge={showCompanyBadge} />
        ))}
      </div>

      {orphans.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">ยังไม่กำหนดหัวหน้า ({orphans.length} คน)</span>
          </div>
          <div className="space-y-0.5">
            {orphans.map((m) => (
              <MemberRow key={m.id} member={m} depth={0} childCount={0} showCompanyBadge={showCompanyBadge} />
            ))}
          </div>
        </div>
      )}

      {isDragActive && <OrphanDropZone />}
    </>
  );
}

function OrphanDropZone() {
  const { ref, isDropTarget } = useDroppable({ id: "orphan-zone" });

  return (
    <div
      ref={ref}
      className={`mt-4 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 transition-colors ${
        isDropTarget
          ? "border-red-400 bg-red-50 text-red-600"
          : "border-muted-foreground/30 text-muted-foreground"
      }`}
    >
      <UserMinus className="h-5 w-5" />
      <span className="text-sm font-medium">วางที่นี่เพื่อยกเลิกหัวหน้า</span>
    </div>
  );
}

function TreeNodeRow({ node, depth, showCompanyBadge }: { node: TreeNode; depth: number; showCompanyBadge: boolean }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const descendantCount = countDescendants(node);

  return (
    <div>
      <div className="flex items-center">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            style={{ marginLeft: `${depth * 24}px` }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6 shrink-0" style={{ marginLeft: `${depth * 24}px` }} />
        )}
        <MemberRow member={node.member} depth={0} childCount={descendantCount} showCompanyBadge={showCompanyBadge} />
      </div>
      {expanded &&
        node.children.map((child) => (
          <TreeNodeRow key={child.member.id} node={child} depth={depth + 1} showCompanyBadge={showCompanyBadge} />
        ))}
    </div>
  );
}

function MemberRow({
  member,
  depth,
  childCount,
  showCompanyBadge,
}: {
  member: MemberWithProfile;
  depth: number;
  childCount: number;
  showCompanyBadge: boolean;
}) {
  const { ref: draggableRef, handleRef, isDragSource } = useDraggable({
    id: `drag-${member.id}`,
    data: { memberId: member.id },
  });
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: `drop-${member.id}`,
    data: { memberId: member.id },
  });

  const combinedRef = useCallback(
    (el: HTMLDivElement | null) => {
      draggableRef(el);
      droppableRef(el);
    },
    [draggableRef, droppableRef]
  );

  const profile = member.profiles;
  const initials = getInitials(profile?.full_name || "?");
  const levelColor = member.org_level ? getLevelColor(member.org_level) : "bg-gray-100 text-gray-600";
  const departmentName = member.departments?.name || profile?.department;

  return (
    <div
      ref={combinedRef}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0 ${
        isDragSource
          ? "opacity-40"
          : isDropTarget
            ? "ring-2 ring-blue-500 bg-blue-50"
            : "hover:bg-muted/50"
      }`}
      style={{ paddingLeft: depth > 0 ? `${depth * 24 + 12}px` : undefined }}
    >
      <div ref={handleRef} className="cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground/50 hover:text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${levelColor}`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{profile?.full_name || "-"}</span>
          {member.org_level && (
            <Badge variant="outline" className="shrink-0 font-mono text-[10px] px-1.5 py-0">
              L{member.org_level}
            </Badge>
          )}
          {showCompanyBadge && member.companies && (
            <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
              {member.companies.name_th}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {profile?.position && <span className="truncate">{profile.position}</span>}
          {profile?.position && departmentName && <span>·</span>}
          {departmentName && <span className="truncate">{departmentName}</span>}
        </div>
      </div>
      {childCount > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground shrink-0">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs">{childCount}</span>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    9: "bg-amber-100 text-amber-800",
    8: "bg-orange-100 text-orange-800",
    7: "bg-red-100 text-red-800",
    6: "bg-purple-100 text-purple-800",
    5: "bg-indigo-100 text-indigo-800",
    4: "bg-blue-100 text-blue-800",
    3: "bg-cyan-100 text-cyan-800",
    2: "bg-teal-100 text-teal-800",
    1: "bg-green-100 text-green-800",
  };
  return colors[level] || "bg-gray-100 text-gray-600";
}
