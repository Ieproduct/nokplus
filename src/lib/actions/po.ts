"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateNetPayable, WhtType } from "@/lib/utils/tax";
import { getActiveCompanyId, getCompanyIdOrActive, getUserCompanyIds } from "@/lib/company-context";
import { requirePermission } from "@/lib/permissions";
import type { Database } from "@/lib/types";

export async function getPurchaseOrders(filters?: {
  q?: string;
  status?: string;
  allCompanies?: boolean;
}) {
  await requirePermission("po.view");
  const supabase = await createClient();

  let query = supabase
    .from("purchase_orders")
    .select(
      "*, vendors(name), profiles!purchase_orders_created_by_fkey(full_name), companies(name_th)"
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
    query = query.eq(
      "status",
      filters.status as Database["public"]["Enums"]["document_status"]
    );
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getPurchaseOrder(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, vendors(*), profiles!purchase_orders_created_by_fkey(full_name), po_line_items(*), purchase_requisitions(document_number, title)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

interface POLineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export async function createPurchaseOrder(input: {
  pr_id?: string;
  vendor_id: string;
  title: string;
  description?: string;
  department: string;
  cost_center?: string;
  delivery_date?: string;
  payment_term: string;
  wht_type: WhtType;
  notes?: string;
  items: POLineItem[];
  companyId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const companyId = await getCompanyIdOrActive(input.companyId);

  await requirePermission("po.create");
  const { data: docNumber } = await supabase.rpc("generate_document_number", {
    doc_prefix: "PO",
  });

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const calc = calculateNetPayable(subtotal, input.wht_type);

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({
      document_number: docNumber!,
      pr_id: input.pr_id || null,
      vendor_id: input.vendor_id,
      title: input.title,
      description: input.description || null,
      department: input.department,
      cost_center: input.cost_center || null,
      created_by: user.id,
      delivery_date: input.delivery_date || null,
      payment_term: input.payment_term,
      status: "draft",
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

  if (poError) throw poError;

  const lineItems = input.items.map((item, index) => ({
    po_id: po.id,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
  }));

  const { error: itemsError } = await supabase
    .from("po_line_items")
    .insert(lineItems);

  if (itemsError) throw itemsError;

  revalidatePath("/dashboard/po");
  return { success: true, id: po.id };
}

export async function updatePurchaseOrder(
  id: string,
  input: {
    vendor_id: string;
    title: string;
    description?: string;
    department: string;
    cost_center?: string;
    delivery_date?: string;
    payment_term: string;
    wht_type: WhtType;
    notes?: string;
    items: POLineItem[];
  }
) {
  const supabase = await createClient();

  await requirePermission("po.edit");
  // Verify status allows editing
  const { data: existing, error: fetchError } = await supabase
    .from("purchase_orders")
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

  // Update PO
  const { error: poError } = await supabase
    .from("purchase_orders")
    .update({
      vendor_id: input.vendor_id,
      title: input.title,
      description: input.description || null,
      department: input.department,
      cost_center: input.cost_center || null,
      delivery_date: input.delivery_date || null,
      payment_term: input.payment_term,
      wht_type: input.wht_type,
      subtotal: calc.subtotal,
      vat_amount: calc.vatAmount,
      wht_amount: calc.whtAmount,
      total_amount: calc.totalAmount,
      net_amount: calc.netAmount,
      notes: input.notes || null,
    })
    .eq("id", id);

  if (poError) throw poError;

  // Delete existing line items and re-create
  await supabase.from("po_line_items").delete().eq("po_id", id);

  const lineItems = input.items.map((item, index) => ({
    po_id: id,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
  }));

  const { error: itemsError } = await supabase
    .from("po_line_items")
    .insert(lineItems);

  if (itemsError) throw itemsError;

  revalidatePath("/dashboard/po");
  return { success: true };
}

export async function submitPOForApproval(id: string) {
  const { submitDocumentForApproval } = await import("@/lib/actions/approval");
  return submitDocumentForApproval("po", id, "purchase_orders");
}
