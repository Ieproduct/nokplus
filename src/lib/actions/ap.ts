"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateNetPayable, WhtType } from "@/lib/utils/tax";
import { getActiveCompanyId, getCompanyIdOrActive, getUserCompanyIds } from "@/lib/company-context";
import { requirePermission } from "@/lib/permissions";
import type { Database } from "@/lib/types";

export async function getApVouchers(filters?: {
  q?: string;
  status?: string;
  allCompanies?: boolean;
}) {
  await requirePermission("ap.view");
  const supabase = await createClient();

  let query = supabase
    .from("ap_vouchers")
    .select(
      "*, vendors(name), profiles!ap_vouchers_created_by_fkey(full_name), companies(name_th)"
    );

  if (filters?.allCompanies) {
    const companyIds = await getUserCompanyIds();
    query = query.in("company_id", companyIds);
  } else {
    const companyId = await getActiveCompanyId();
    query = query.eq("company_id", companyId);
  }

  if (filters?.q) {
    query = query.or(
      `document_number.ilike.%${filters.q}%,title.ilike.%${filters.q}%`
    );
  }
  if (filters?.status) {
    // Handle both document status and payment status
    if (["unpaid", "partial", "paid"].includes(filters.status)) {
      query = query.eq(
        "payment_status",
        filters.status as Database["public"]["Enums"]["payment_status"]
      );
    } else {
      query = query.eq(
        "status",
        filters.status as Database["public"]["Enums"]["document_status"]
      );
    }
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getApVoucher(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ap_vouchers")
    .select("*, vendors(*), profiles!ap_vouchers_created_by_fkey(full_name), ap_line_items(*), purchase_orders(document_number, title)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

interface APLineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export async function createApVoucher(input: {
  po_id?: string;
  vendor_id: string;
  title: string;
  description?: string;
  department: string;
  cost_center?: string;
  due_date?: string;
  invoice_number?: string;
  invoice_date?: string;
  wht_type: WhtType;
  notes?: string;
  items: APLineItem[];
  companyId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const companyId = await getCompanyIdOrActive(input.companyId);

  await requirePermission("ap.create");
  const { data: docNumber } = await supabase.rpc("generate_document_number", {
    doc_prefix: "AP",
  });

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const calc = calculateNetPayable(subtotal, input.wht_type);

  const { data: ap, error: apError } = await supabase
    .from("ap_vouchers")
    .insert({
      document_number: docNumber!,
      po_id: input.po_id || null,
      vendor_id: input.vendor_id,
      title: input.title,
      description: input.description || null,
      department: input.department,
      cost_center: input.cost_center || null,
      created_by: user.id,
      due_date: input.due_date || null,
      invoice_number: input.invoice_number || null,
      invoice_date: input.invoice_date || null,
      status: "draft",
      payment_status: "unpaid",
      wht_type: input.wht_type,
      subtotal: calc.subtotal,
      vat_amount: calc.vatAmount,
      wht_amount: calc.whtAmount,
      total_amount: calc.totalAmount,
      net_amount: calc.netAmount,
      notes: input.notes || null,
      company_id: companyId,
    })
    .select()
    .single();

  if (apError) throw apError;

  const lineItems = input.items.map((item, index) => ({
    ap_id: ap.id,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
  }));

  const { error: itemsError } = await supabase
    .from("ap_line_items")
    .insert(lineItems);

  if (itemsError) throw itemsError;

  revalidatePath("/dashboard/ap");
  return { success: true, id: ap.id };
}

export async function updateApVoucher(
  id: string,
  input: {
    vendor_id: string;
    title: string;
    description?: string;
    department: string;
    cost_center?: string;
    due_date?: string;
    invoice_number?: string;
    invoice_date?: string;
    wht_type: WhtType;
    notes?: string;
    items: APLineItem[];
  }
) {
  const supabase = await createClient();

  await requirePermission("ap.edit");
  // Verify status allows editing
  const { data: existing, error: fetchError } = await supabase
    .from("ap_vouchers")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;
  if (existing.status !== "draft" && existing.status !== "revision") {
    throw new Error("ไม่สามารถแก้ไขได้ สถานะปัจจุบันไม่อนุญาต");
  }

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const calc = calculateNetPayable(subtotal, input.wht_type);

  // Update AP voucher
  const { error: apError } = await supabase
    .from("ap_vouchers")
    .update({
      vendor_id: input.vendor_id,
      title: input.title,
      description: input.description || null,
      department: input.department,
      cost_center: input.cost_center || null,
      due_date: input.due_date || null,
      invoice_number: input.invoice_number || null,
      invoice_date: input.invoice_date || null,
      wht_type: input.wht_type,
      subtotal: calc.subtotal,
      vat_amount: calc.vatAmount,
      wht_amount: calc.whtAmount,
      total_amount: calc.totalAmount,
      net_amount: calc.netAmount,
      notes: input.notes || null,
    })
    .eq("id", id);

  if (apError) throw apError;

  // Delete existing line items and re-create
  await supabase.from("ap_line_items").delete().eq("ap_id", id);

  const lineItems = input.items.map((item, index) => ({
    ap_id: id,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
  }));

  const { error: itemsError } = await supabase
    .from("ap_line_items")
    .insert(lineItems);

  if (itemsError) throw itemsError;

  revalidatePath("/dashboard/ap");
  return { success: true };
}

export async function updateApChecklist(
  id: string,
  checklist: {
    check_invoice_original?: boolean;
    check_po_copy?: boolean;
    check_delivery_note?: boolean;
    check_inspection_report?: boolean;
    check_tax_invoice?: boolean;
    check_wht_cert?: boolean;
    check_receipt?: boolean;
    check_approval_doc?: boolean;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ap_vouchers")
    .update(checklist)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/ap");
  return { success: true };
}

export async function updatePaymentStatus(
  id: string,
  status: "unpaid" | "partial" | "paid",
  paidAmount?: number
) {
  await requirePermission("ap.pay");
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { payment_status: status };
  if (status === "paid") {
    updateData.paid_date = new Date().toISOString().split("T")[0];
  }
  if (paidAmount !== undefined) {
    updateData.paid_amount = paidAmount;
  }

  const { error } = await supabase
    .from("ap_vouchers")
    .update(updateData)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/ap");
  return { success: true };
}

export async function submitAPForApproval(id: string) {
  const { submitDocumentForApproval } = await import("@/lib/actions/approval");
  return submitDocumentForApproval("ap", id, "ap_vouchers");
}
