"use client";

import { useState } from "react";
import { addMember, removeMember, updateMemberRole } from "@/lib/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  role: string;
  org_level: number | null;
  department_id: string | null;
  max_approval_amount: number | null;
  profiles: {
    full_name: string;
    email: string;
    position: string | null;
    department: string | null;
  } | null;
  departments: {
    id: string;
    code: string;
    name: string;
  } | null;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "เจ้าของ",
  admin: "ผู้ดูแล",
  member: "สมาชิก",
};

export function MemberManager({ members }: { members: Member[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!email) return;
    setLoading(true);
    try {
      const result = await addMember(email.trim(), role, name.trim() || undefined);
      if (result.success) {
        toast.success(result.invited
          ? "ส่งอีเมลเชิญเรียบร้อย ผู้ใช้จะได้รับลิงก์ตั้งรหัสผ่าน"
          : "เพิ่มสมาชิกเรียบร้อย"
        );
        setName("");
        setEmail("");
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("ต้องการลบสมาชิกนี้?")) return;
    try {
      const result = await removeMember(memberId);
      if (result.success) {
        toast.success("ลบสมาชิกเรียบร้อย");
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  }

  async function handleRoleChange(memberId: string, newRole: "admin" | "member") {
    try {
      const result = await updateMemberRole(memberId, newRole);
      if (result.success) {
        toast.success("เปลี่ยนบทบาทเรียบร้อย");
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  }

  function getDepartmentName(m: Member) {
    return m.departments?.name || m.profiles?.department || "-";
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="ชื่อ-นามสกุล"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="อีเมล"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={role} onValueChange={(v) => setRole(v as "admin" | "member")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">ผู้ดูแล</SelectItem>
              <SelectItem value="member">สมาชิก</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={loading || !email}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่ม
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>ระดับ</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.profiles?.full_name || "-"}</TableCell>
                <TableCell>{m.profiles?.email || "-"}</TableCell>
                <TableCell>
                  <span className={getDepartmentName(m) !== "-" ? "" : "text-muted-foreground"}>
                    {getDepartmentName(m)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{m.profiles?.position || "-"}</TableCell>
                <TableCell>
                  {m.org_level ? (
                    <Badge variant="outline" className="font-mono">L{m.org_level}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {m.role === "owner" ? (
                    <Badge>{ROLE_LABELS[m.role]}</Badge>
                  ) : (
                    <Select
                      value={m.role}
                      onValueChange={(v) => handleRoleChange(m.id, v as "admin" | "member")}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">ผู้ดูแล</SelectItem>
                        <SelectItem value="member">สมาชิก</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {m.role !== "owner" && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(m.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
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
