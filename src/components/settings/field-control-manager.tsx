"use client";

import { useState } from "react";
import { upsertFieldControl } from "@/lib/actions/document-config";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface FieldControl {
  id: string;
  document_type: string;
  field_name: string;
  field_label: string;
  is_required: boolean;
  is_visible: boolean;
  is_editable: boolean;
  default_value: string | null;
  sort_order: number | null;
}

const DOC_TYPES = [
  { value: "pr", label: "PR" },
  { value: "po", label: "PO" },
  { value: "ap", label: "AP" },
];

export function FieldControlManager({ controls }: { controls: FieldControl[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  function getFieldsByType(docType: string) {
    return controls
      .filter((c) => c.document_type === docType)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  async function handleToggle(
    field: FieldControl,
    key: "is_required" | "is_visible" | "is_editable",
    value: boolean
  ) {
    const loadingKey = `${field.id}-${key}`;
    setLoading(loadingKey);
    try {
      await upsertFieldControl({
        document_type: field.document_type,
        field_name: field.field_name,
        field_label: field.field_label,
        is_required: key === "is_required" ? value : field.is_required,
        is_visible: key === "is_visible" ? value : field.is_visible,
        is_editable: key === "is_editable" ? value : field.is_editable,
        default_value: field.default_value || undefined,
      });
      toast.success("บันทึกเรียบร้อย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(null);
    }
  }

  function renderTable(docType: string) {
    const fields = getFieldsByType(docType);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ฟิลด์</TableHead>
            <TableHead>ชื่อ</TableHead>
            <TableHead className="w-20 text-center">จำเป็น</TableHead>
            <TableHead className="w-20 text-center">แสดง</TableHead>
            <TableHead className="w-20 text-center">แก้ไขได้</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.id}>
              <TableCell className="font-mono text-sm">{field.field_name}</TableCell>
              <TableCell>{field.field_label}</TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={field.is_required}
                  disabled={loading === `${field.id}-is_required`}
                  onCheckedChange={(v) => handleToggle(field, "is_required", v === true)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={field.is_visible}
                  disabled={loading === `${field.id}-is_visible`}
                  onCheckedChange={(v) => handleToggle(field, "is_visible", v === true)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={field.is_editable}
                  disabled={loading === `${field.id}-is_editable`}
                  onCheckedChange={(v) => handleToggle(field, "is_editable", v === true)}
                />
              </TableCell>
            </TableRow>
          ))}
          {fields.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                ยังไม่มีฟิลด์สำหรับเอกสารประเภทนี้
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="font-medium">ควบคุมฟิลด์เอกสาร</h3>
          <p className="text-sm text-muted-foreground mt-1">กำหนดฟิลด์ที่จำเป็น แสดง และแก้ไขได้ สำหรับแต่ละประเภทเอกสาร</p>
        </div>

        <Tabs defaultValue="pr">
          <TabsList>
            {DOC_TYPES.map((dt) => (
              <TabsTrigger key={dt.value} value={dt.value}>
                {dt.label} ({getFieldsByType(dt.value).length})
              </TabsTrigger>
            ))}
          </TabsList>
          {DOC_TYPES.map((dt) => (
            <TabsContent key={dt.value} value={dt.value}>
              {renderTable(dt.value)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
