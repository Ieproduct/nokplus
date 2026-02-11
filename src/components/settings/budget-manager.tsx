"use client";

import { useState } from "react";
import {
  createBudgetControl,
  updateBudgetControl,
  deleteBudgetControl,
} from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
}

interface CostCenter {
  id: string;
  name: string;
}

interface BudgetControl {
  id: string;
  fiscal_year: number;
  department_id: string | null;
  cost_center_id: string | null;
  budget_amount: number;
  used_amount: number;
  reserved_amount: number;
  departments: { name: string } | null;
  cost_centers: { name: string } | null;
}

export function BudgetManager({
  budgets,
  departments,
  costCenters,
}: {
  budgets: BudgetControl[];
  departments: Department[];
  costCenters: CostCenter[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetControl | null>(null);
  const [loading, setLoading] = useState(false);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [costCenterId, setCostCenterId] = useState<string>("");

  function openCreate() {
    setEditing(null);
    setDepartmentId("");
    setCostCenterId("");
    setOpen(true);
  }

  function openEdit(budget: BudgetControl) {
    setEditing(budget);
    setDepartmentId(budget.department_id || "");
    setCostCenterId(budget.cost_center_id || "");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);

      if (editing) {
        const data = {
          budget_amount: parseFloat(form.get("budget_amount") as string),
        };
        await updateBudgetControl(editing.id, data);
        toast.success("แก้ไขงบประมาณเรียบร้อย");
      } else {
        const data = {
          fiscal_year: parseInt(form.get("fiscal_year") as string, 10),
          department_id: departmentId || undefined,
          cost_center_id: costCenterId || undefined,
          budget_amount: parseFloat(form.get("budget_amount") as string),
        };
        await createBudgetControl(data);
        toast.success("เพิ่มงบประมาณเรียบร้อย");
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบงบประมาณนี้?")) return;
    try {
      await deleteBudgetControl(id);
      toast.success("ลบงบประมาณเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  function formatAmount(n: number) {
    return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
  }

  function getRemaining(b: BudgetControl) {
    return b.budget_amount - (b.used_amount || 0) - (b.reserved_amount || 0);
  }

  function getRemainingColor(b: BudgetControl) {
    const remaining = getRemaining(b);
    const ratio = remaining / b.budget_amount;
    if (ratio <= 0) return "text-destructive font-semibold";
    if (ratio <= 0.2) return "text-orange-600 font-semibold";
    return "text-green-600";
  }

  const currentBuddhistYear = new Date().getFullYear() + 543;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">งบประมาณทั้งหมด ({budgets.length})</h3>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มงบประมาณ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ปีงบ</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead className="text-right">งบประมาณ</TableHead>
              <TableHead className="text-right">ใช้ไป</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono">{b.fiscal_year}</TableCell>
                <TableCell>{b.departments?.name || "-"}</TableCell>
                <TableCell>{b.cost_centers?.name || "-"}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatAmount(b.budget_amount)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatAmount(b.used_amount || 0)}
                </TableCell>
                <TableCell className={cn("text-right font-mono", getRemainingColor(b))}>
                  {formatAmount(getRemaining(b))}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {budgets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  ยังไม่มีงบประมาณ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "แก้ไขงบประมาณ" : "เพิ่มงบประมาณ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <>
                  <div>
                    <Label htmlFor="fiscal_year">ปีงบประมาณ (พ.ศ.) *</Label>
                    <Input
                      id="fiscal_year"
                      name="fiscal_year"
                      type="number"
                      defaultValue={currentBuddhistYear}
                      required
                    />
                  </div>
                  <div>
                    <Label>แผนก</Label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกแผนก (ไม่บังคับ)" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cost Center</Label>
                    <Select value={costCenterId} onValueChange={setCostCenterId}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Cost Center (ไม่บังคับ)" />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="budget_amount">งบประมาณ (บาท) *</Label>
                <Input
                  id="budget_amount"
                  name="budget_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing?.budget_amount ?? ""}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
