"use client";

import { useState } from "react";
import { updateOrganizationLevel, updateMemberOrgLevel, addMemberToCompany, removeMemberFromCompany } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, Save, Plus, Trash2, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface OrgLevel {
  id: string;
  level: number;
  label_th: string;
  label_en: string | null;
  is_active: boolean;
  member_count: number;
}

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

export function OrgStructureManager({
  levels,
  members,
  companies,
  departments,
}: {
  levels: OrgLevel[];
  members: MemberWithProfile[];
  companies: CompanyInfo[];
  departments: DepartmentInfo[];
}) {
  return (
    <div className="space-y-6">
      <LevelLabelsSection levels={levels} />
      <MemberAssignmentSection
        levels={levels}
        members={members}
        companies={companies}
        departments={departments}
      />
    </div>
  );
}

function LevelLabelsSection({ levels }: { levels: OrgLevel[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabelTh, setEditLabelTh] = useState("");
  const [editLabelEn, setEditLabelEn] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(level: OrgLevel) {
    setEditingId(level.id);
    setEditLabelTh(level.label_th);
    setEditLabelEn(level.label_en || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabelTh("");
    setEditLabelEn("");
  }

  async function saveEdit(levelId: string) {
    setSaving(true);
    try {
      const result = await updateOrganizationLevel(levelId, {
        label_th: editLabelTh,
        label_en: editLabelEn || undefined,
      });
      if (result.success) {
        toast.success("บันทึกเรียบร้อย");
        setEditingId(null);
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">ชื่อระดับตำแหน่ง</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ระดับ</TableHead>
              <TableHead>ชื่อ (ไทย)</TableHead>
              <TableHead>ชื่อ (EN)</TableHead>
              <TableHead className="w-24">สมาชิก</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono">L{level.level}</Badge>
                </TableCell>
                <TableCell>
                  {editingId === level.id ? (
                    <Input
                      value={editLabelTh}
                      onChange={(e) => setEditLabelTh(e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    level.label_th
                  )}
                </TableCell>
                <TableCell>
                  {editingId === level.id ? (
                    <Input
                      value={editLabelEn}
                      onChange={(e) => setEditLabelEn(e.target.value)}
                      className="h-8"
                      placeholder="English name"
                    />
                  ) : (
                    <span className="text-muted-foreground">{level.label_en || "-"}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{level.member_count}</Badge>
                </TableCell>
                <TableCell>
                  {editingId === level.id ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => saveEdit(level.id)} disabled={saving || !editLabelTh}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={cancelEdit}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => startEdit(level)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function MemberAssignmentSection({
  levels,
  members,
  companies,
  departments,
}: {
  levels: OrgLevel[];
  members: MemberWithProfile[];
  companies: CompanyInfo[];
  departments: DepartmentInfo[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<string>("");
  const [editMaxAmount, setEditMaxAmount] = useState<string>("");
  const [editReportsTo, setEditReportsTo] = useState<string>("");
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [editPosition, setEditPosition] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Add member form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addCompanyId, setAddCompanyId] = useState<string>(companies[0]?.id || "");
  const [addEmail, setAddEmail] = useState("");
  const [addFullName, setAddFullName] = useState("");
  const [addDepartmentId, setAddDepartmentId] = useState("");
  const [addPosition, setAddPosition] = useState("");
  const [addRole, setAddRole] = useState<"admin" | "member">("member");
  const [adding, setAdding] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startEdit(member: MemberWithProfile) {
    setEditingId(member.id);
    setEditLevel(member.org_level ? String(member.org_level) : "");
    setEditMaxAmount(member.max_approval_amount ? String(member.max_approval_amount) : "");
    setEditReportsTo(member.reports_to_member_id || "");
    setEditDepartmentId(member.department_id || "");
    setEditPosition(member.profiles?.position || "");
    setEditRole(member.role);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  // Get all descendant member IDs for a given member (to prevent circular refs)
  function getDescendantIds(memberId: string): Set<string> {
    const descendants = new Set<string>();
    const queue = [memberId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const m of members) {
        if (m.reports_to_member_id === current && !descendants.has(m.id)) {
          descendants.add(m.id);
          queue.push(m.id);
        }
      }
    }
    return descendants;
  }

  // Get available "reports to" options grouped by company
  function getReportsToOptions(memberId: string) {
    const descendants = getDescendantIds(memberId);
    const available = members.filter((m) => m.id !== memberId && !descendants.has(m.id));

    // Group by company_id
    const grouped = new Map<string, MemberWithProfile[]>();
    for (const m of available) {
      const existing = grouped.get(m.company_id) || [];
      existing.push(m);
      grouped.set(m.company_id, existing);
    }
    return grouped;
  }

  // Get departments for a specific company
  function getDepartmentsForCompany(companyId: string) {
    return departments.filter((d) => d.company_id === companyId);
  }

  function getCompanyName(companyId: string) {
    return companies.find((c) => c.id === companyId)?.name_th || companyId;
  }

  async function saveEdit(memberId: string) {
    setSaving(true);
    try {
      const member = members.find((m) => m.id === memberId);
      const result = await updateMemberOrgLevel(memberId, {
        org_level: editLevel ? parseInt(editLevel) : null,
        max_approval_amount: editMaxAmount ? parseFloat(editMaxAmount) : null,
        reports_to_member_id: editReportsTo || null,
        department_id: editDepartmentId || null,
        position: editPosition || null,
        role: member?.role === "owner" ? undefined : (editRole as "admin" | "member"),
      });
      if (result.success) {
        toast.success("บันทึกเรียบร้อย");
        setEditingId(null);
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMember() {
    if (!addCompanyId || !addEmail) {
      toast.error("กรุณากรอกบริษัทและอีเมล");
      return;
    }
    setAdding(true);
    try {
      const result = await addMemberToCompany(addCompanyId, addEmail, {
        role: addRole,
        fullName: addFullName || undefined,
        departmentId: addDepartmentId || undefined,
        position: addPosition || undefined,
      });
      if (result.success) {
        toast.success(result.invited ? "เชิญสมาชิกใหม่เรียบร้อย (ส่งอีเมลแล้ว)" : "เพิ่มสมาชิกเรียบร้อย");
        setAddEmail("");
        setAddFullName("");
        setAddDepartmentId("");
        setAddPosition("");
        setAddRole("member");
        setShowAddForm(false);
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    setDeletingId(memberId);
    try {
      const result = await removeMemberFromCompany(memberId);
      if (result.success) {
        toast.success("ลบสมาชิกเรียบร้อย");
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setDeletingId(null);
    }
  }

  function getLevelLabel(orgLevel: number | null) {
    if (!orgLevel) return "-";
    const level = levels.find((l) => l.level === orgLevel);
    return level ? `L${orgLevel}: ${level.label_th}` : `L${orgLevel}`;
  }

  function getManagerName(reportsToId: string | null) {
    if (!reportsToId) return "-";
    const manager = members.find((m) => m.id === reportsToId);
    if (!manager) return "-";
    const name = manager.profiles?.full_name || "-";
    // Show company name if cross-company
    if (companies.length > 1 && manager.companies) {
      return `${name} (${manager.companies.name_th})`;
    }
    return name;
  }

  function getDepartmentName(member: MemberWithProfile) {
    return member.departments?.name || member.profiles?.department || "-";
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "owner":
        return <Badge variant="default">เจ้าของ</Badge>;
      case "admin":
        return <Badge variant="secondary">ผู้ดูแล</Badge>;
      default:
        return <Badge variant="outline">สมาชิก</Badge>;
    }
  }

  const multiCompany = companies.length > 1;
  const addDepartments = getDepartmentsForCompany(addCompanyId);
  const colSpan = multiCompany ? 9 : 8;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">กำหนดระดับสมาชิก ({members.length} คน)</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <ChevronUp className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            เพิ่มสมาชิก
          </Button>
        </div>

        {showAddForm && (
          <div className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
            <h4 className="text-sm font-medium">เพิ่มสมาชิกใหม่</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {multiCompany && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">บริษัท</label>
                  <Select value={addCompanyId} onValueChange={(v) => { setAddCompanyId(v); setAddDepartmentId(""); }}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="เลือกบริษัท" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name_th}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">อีเมล *</label>
                <Input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ชื่อ-นามสกุล</label>
                <Input
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  placeholder="ชื่อ นามสกุล"
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">แผนก</label>
                <Select value={addDepartmentId || "__none__"} onValueChange={(v) => setAddDepartmentId(v === "__none__" ? "" : v)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="เลือกแผนก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">-- ไม่ระบุ --</SelectItem>
                    {addDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ตำแหน่ง</label>
                <Input
                  value={addPosition}
                  onChange={(e) => setAddPosition(e.target.value)}
                  placeholder="ตำแหน่งงาน"
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">บทบาท</label>
                <Select value={addRole} onValueChange={(v) => setAddRole(v as "admin" | "member")}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">สมาชิก</SelectItem>
                    <SelectItem value="admin">ผู้ดูแล</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>ยกเลิก</Button>
              <Button size="sm" onClick={handleAddMember} disabled={adding || !addEmail}>
                {adding ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              {multiCompany && <TableHead>บริษัท</TableHead>}
              <TableHead>แผนก</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>ระดับ</TableHead>
              <TableHead>รายงานตรงต่อ</TableHead>
              <TableHead>วงเงินอนุมัติสูงสุด</TableHead>
              <TableHead className="w-28"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const profile = member.profiles as {
                full_name: string;
                email: string;
                position: string | null;
                department: string | null;
              } | null;

              const memberDepartments = getDepartmentsForCompany(member.company_id);
              const isOwner = member.role === "owner";

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{profile?.full_name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{profile?.email || ""}</div>
                    </div>
                  </TableCell>
                  {multiCompany && (
                    <TableCell>
                      <span className="text-sm">{member.companies?.name_th || "-"}</span>
                    </TableCell>
                  )}
                  <TableCell>
                    {editingId === member.id ? (
                      <Select value={editDepartmentId || "__none__"} onValueChange={(v) => setEditDepartmentId(v === "__none__" ? "" : v)}>
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue placeholder="เลือกแผนก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">-- ไม่ระบุ --</SelectItem>
                          {memberDepartments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={getDepartmentName(member) !== "-" ? "" : "text-muted-foreground"}>
                        {getDepartmentName(member)}
                      </span>
                    )}
                  </TableCell>
                  {/* Position column */}
                  <TableCell>
                    {editingId === member.id ? (
                      <Input
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className="h-8 w-36"
                        placeholder="ตำแหน่ง"
                      />
                    ) : (
                      <span className={profile?.position ? "" : "text-muted-foreground"}>
                        {profile?.position || "-"}
                      </span>
                    )}
                  </TableCell>
                  {/* Role column */}
                  <TableCell>
                    {editingId === member.id && !isOwner ? (
                      <Select value={editRole} onValueChange={setEditRole}>
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">สมาชิก</SelectItem>
                          <SelectItem value="admin">ผู้ดูแล</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getRoleBadge(member.role)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === member.id ? (
                      <Select value={editLevel || "__none__"} onValueChange={(v) => setEditLevel(v === "__none__" ? "" : v)}>
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue placeholder="เลือกระดับ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">-- ไม่ระบุ --</SelectItem>
                          {levels.map((l) => (
                            <SelectItem key={l.level} value={String(l.level)}>
                              L{l.level}: {l.label_th}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      member.org_level ? (
                        <Badge variant="outline">{getLevelLabel(member.org_level)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === member.id ? (
                      <Select value={editReportsTo || "__none__"} onValueChange={(v) => setEditReportsTo(v === "__none__" ? "" : v)}>
                        <SelectTrigger className="h-8 w-52">
                          <SelectValue placeholder="เลือกหัวหน้า" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">-- ไม่มี --</SelectItem>
                          {multiCompany ? (
                            // Grouped by company
                            Array.from(getReportsToOptions(member.id).entries()).map(([companyId, companyMembers]) => (
                              <SelectGroup key={companyId}>
                                <SelectLabel>{getCompanyName(companyId)}</SelectLabel>
                                {companyMembers.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.profiles?.full_name || m.user_id}
                                    {m.org_level ? ` (L${m.org_level})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))
                          ) : (
                            // Flat list for single company
                            Array.from(getReportsToOptions(member.id).values()).flat().map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.profiles?.full_name || m.user_id}
                                {m.org_level ? ` (L${m.org_level})` : ""}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={member.reports_to_member_id ? "" : "text-muted-foreground"}>
                        {getManagerName(member.reports_to_member_id)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === member.id ? (
                      <Input
                        type="number"
                        value={editMaxAmount}
                        onChange={(e) => setEditMaxAmount(e.target.value)}
                        className="h-8 w-36"
                        placeholder="ว่าง = ไม่จำกัด"
                      />
                    ) : (
                      member.max_approval_amount ? (
                        <span>{new Intl.NumberFormat("th-TH").format(Number(member.max_approval_amount))} บาท</span>
                      ) : (
                        <span className="text-muted-foreground">ไม่จำกัด</span>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === member.id ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => saveEdit(member.id)} disabled={saving}>
                          <Save className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEdit}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(member)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!isOwner && (
                          deletingId === member.id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveMember(member.id)}
                                title="ยืนยันลบ"
                              >
                                <Check className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeletingId(null)} title="ยกเลิก">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingId(member.id)}
                              title="ลบสมาชิก"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-8">
                  ยังไม่มีสมาชิก
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
