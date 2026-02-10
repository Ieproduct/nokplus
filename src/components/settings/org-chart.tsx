"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Users, AlertCircle } from "lucide-react";

interface MemberWithProfile {
  id: string;
  user_id: string;
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
      // reports_to points to non-existent member → orphan
      orphans.push(m);
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

export function OrgChart({ members }: { members: MemberWithProfile[] }) {
  const { roots, orphans } = buildTree(members);

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
        <div className="space-y-0.5">
          {roots.map((node) => (
            <TreeNodeRow key={node.member.id} node={node} depth={0} />
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
                <MemberRow key={m.id} member={m} depth={0} childCount={0} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TreeNodeRow({ node, depth }: { node: TreeNode; depth: number }) {
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
        <MemberRow member={node.member} depth={0} childCount={descendantCount} />
      </div>
      {expanded &&
        node.children.map((child) => (
          <TreeNodeRow key={child.member.id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

function MemberRow({
  member,
  depth,
  childCount,
}: {
  member: MemberWithProfile;
  depth: number;
  childCount: number;
}) {
  const profile = member.profiles;
  const initials = getInitials(profile?.full_name || "?");
  const levelColor = member.org_level ? getLevelColor(member.org_level) : "bg-gray-100 text-gray-600";

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors flex-1 min-w-0"
      style={{ paddingLeft: depth > 0 ? `${depth * 24 + 12}px` : undefined }}
    >
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
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {profile?.position && <span className="truncate">{profile.position}</span>}
          {profile?.position && profile?.department && <span>·</span>}
          {profile?.department && <span className="truncate">{profile.department}</span>}
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
