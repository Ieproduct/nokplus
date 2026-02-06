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
  profiles: {
    full_name: string;
    email: string;
    position: string;
    department: string;
  } | null;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "เจ้าของ",
  admin: "ผู้ดูแล",
  member: "สมาชิก",
};

export function MemberManager({ members }: { members: Member[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!email) return;
    setLoading(true);
    try {
      await addMember(email, role);
      toast.success("เพิ่มสมาชิกเรียบร้อย");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("ต้องการลบสมาชิกนี้?")) return;
    try {
      await removeMember(memberId);
      toast.success("ลบสมาชิกเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleRoleChange(memberId: string, newRole: "admin" | "member") {
    try {
      await updateMemberRole(memberId, newRole);
      toast.success("เปลี่ยนบทบาทเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="อีเมลผู้ใช้ที่ต้องการเพิ่ม"
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
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.profiles?.full_name || "-"}</TableCell>
                <TableCell>{m.profiles?.email || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{m.profiles?.position || "-"}</TableCell>
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
