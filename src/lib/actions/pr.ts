"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateVat } from "@/lib/utils/tax";
import { getActiveCompanyId } from "@/lib/company-context";
import type { Database } from "@/lib/types";

export async function getPurchaseRequisitions(filters?: {
  q?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();
  let query = supabase
    .from("purchase_requisitions")
    .select("*, profiles!purchase_requisitions_requested_by_fkey(full_name)")
    .eq("company_id", companyId);

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

export async function getPurchaseRequisition(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_requisitions")
    .select("*, profiles!purchase_requisitions_requested_by_fkey(full_name), pr_line_items(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getApprovedPRs() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase
    .from("purchase_requisitions")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export async function createPurchaseRequisition(input: {
  title: string;
  description?: string;
  department: string;
  cost_center?: string;
  required_date?: string;
  notes?: string;
  items: LineItem[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Generate document number
  const { data: docNumber } = await supabase.rpc("generate_document_number", {
    doc_prefix: "PR",
  });

  // Calculate totals
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const vatAmount = calculateVat(subtotal);
  const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

  const companyId = await getActiveCompanyId();

  // Create PR
  const { data: pr, error: prError } = await supabase
    .from("purchase_requisitions")
    .insert({
      document_number: docNumber!,
      title: input.title,
      description: input.description || null,
      department: input.department,
      cost_center: input.cost_center || null,
      requested_by: user.id,
      required_date: input.required_date || null,
      status: "draft",
      subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      notes: input.notes || null,
      company_id: companyId,
    })
    .select()
    .single();

  if (prError) throw prError;

  // Create line items
  const lineItems = input.items.map((item, index) => ({
    pr_id: pr.id,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
  }));

  const { error: itemsError } = await supabase
    .from("pr_line_items")
    .insert(lineItems);

  if (itemsError) throw itemsError;

  revalidatePath("/dashboard/pr");
  return { success: true, id: pr.id };
}

export async function updatePurchaseRequisition(
  id: string,
  input: {
    title: string;
    description?: string;
    department: string;
    cost_center?: string;
    required_date?: string;
    notes?: string;
    items: LineItem[];
  }
) {
  const supabase = await createClient();

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const vatAmount = calculateVat(subtotal);
  const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

  // Update PR
  const { error: prError } = await supabase
    .from("purchase_requisitions")
    .update({
      title: input.title,
      description: input.description || null,
      department: input.department,
      cost_center: input.cost_center || null,
      required_date: input.required_date || null,
      subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      notes: input.notes || null,
    })
    .eq("id", id);

  if (prError) throw prError;

  // Delete existing line items and re-create
  await supabase.from("pr_line_items").delete().eq("pr_id", id);

  const lineItems = input.items.map((item, index) => ({
    pr_id: id,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price * 100) / 100,
  }));

  const { error: itemsError } = await supabase
    .from("pr_line_items")
    .insert(lineItems);

  if (itemsError) throw itemsError;

  revalidatePath("/dashboard/pr");
  return { success: true };
}

export async function submitPRForApproval(id: string) {
  const { submitDocumentForApproval } = await import("@/lib/actions/approval");
  return submitDocumentForApproval("pr", id, "purchase_requisitions");
}
