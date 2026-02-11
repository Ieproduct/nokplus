"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId, getCompanyIdOrActive, getUserCompanyIds } from "@/lib/company-context";
import { requirePermission } from "@/lib/permissions";

export async function getGoodsReceipts(filters?: {
  q?: string;
  status?: string;
  allCompanies?: boolean;
}) {
  await requirePermission("gr.view");
  const supabase = await createClient();

  let query = supabase
    .from("goods_receipts")
    .select(
      "*, purchase_orders(document_number, title, vendors(name)), profiles!goods_receipts_received_by_fkey(full_name), companies(name_th)"
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
      `document_number.ilike.%${filters.q}%`
    );
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getGoodsReceipt(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goods_receipts")
    .select("*, purchase_orders(document_number, title, vendor_id, vendors(name)), gr_line_items(*, po_line_items(description, quantity, unit, unit_price, received_qty, remaining_qty)), profiles!goods_receipts_received_by_fkey(full_name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getApprovedPOsForGR(forCompanyId?: string) {
  const supabase = await createClient();
  const companyId = await getCompanyIdOrActive(forCompanyId);

  // Get approved POs that have gr_required=true and have remaining qty > 0
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("id, document_number, title, vendor_id, vendors(name)")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPOForGoodsReceipt(poId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, vendors(name), po_line_items(*)")
    .eq("id", poId)
    .single();

  if (error) throw error;
  return data;
}

interface GRLineItem {
  po_line_item_id: string;
  received_qty: number;
  inspection_status?: string;
  storage_location?: string;
  batch_number?: string;
  notes?: string;
}

export async function createGoodsReceipt(input: {
  po_id: string;
  receipt_date: string;
  warehouse?: string;
  notes?: string;
  items: GRLineItem[];
  companyId?: string;
}) {
  await requirePermission("gr.create");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const companyId = await getCompanyIdOrActive(input.companyId);

  const { data: docNumber } = await supabase.rpc("generate_document_number", {
    doc_prefix: "GR",
  });

  const { data: gr, error: grError } = await supabase
    .from("goods_receipts")
    .insert({
      document_number: docNumber!,
      po_id: input.po_id,
      receipt_date: input.receipt_date,
      status: "draft",
      received_by: user.id,
      warehouse: input.warehouse || null,
      notes: input.notes || null,
      company_id: companyId,
    })
    .select()
    .single();

  if (grError) throw grError;

  const lineItems = input.items.map((item, index) => ({
    gr_id: gr.id,
    po_line_item_id: item.po_line_item_id,
    line_number: index + 1,
    received_qty: item.received_qty,
    inspection_status: item.inspection_status || "pending",
    storage_location: item.storage_location || null,
    batch_number: item.batch_number || null,
    notes: item.notes || null,
  }));

  const { error: itemsError } = await supabase
    .from("gr_line_items")
    .insert(lineItems);

  if (itemsError) throw itemsError;

  revalidatePath("/dashboard/gr");
  return { success: true, id: gr.id };
}

export async function confirmGoodsReceipt(id: string) {
  await requirePermission("gr.confirm");
  const supabase = await createClient();

  // Get GR with line items
  const { data: gr, error: grError } = await supabase
    .from("goods_receipts")
    .select("*, gr_line_items(*)")
    .eq("id", id)
    .single();

  if (grError) throw grError;
  if (gr.status !== "draft") {
    throw new Error("สามารถยืนยันได้เฉพาะใบรับสินค้าที่เป็นร่างเท่านั้น");
  }

  // Update PO line items received_qty and remaining_qty
  for (const grLine of gr.gr_line_items) {
    const { data: poLine, error: poLineError } = await supabase
      .from("po_line_items")
      .select("received_qty, remaining_qty, quantity")
      .eq("id", grLine.po_line_item_id)
      .single();

    if (poLineError) throw poLineError;

    const newReceived = (poLine.received_qty || 0) + Number(grLine.received_qty);
    const newRemaining = poLine.quantity - newReceived;

    if (newRemaining < 0) {
      throw new Error(`จำนวนรับเกินจำนวนสั่งซื้อ (รายการ ${grLine.line_number})`);
    }

    const { error: updateError } = await supabase
      .from("po_line_items")
      .update({
        received_qty: newReceived,
        remaining_qty: newRemaining,
      })
      .eq("id", grLine.po_line_item_id);

    if (updateError) throw updateError;
  }

  // Update GR status
  const { error: statusError } = await supabase
    .from("goods_receipts")
    .update({ status: "confirmed" })
    .eq("id", id);

  if (statusError) throw statusError;

  revalidatePath("/dashboard/gr");
  revalidatePath("/dashboard/po");
  return { success: true };
}

export async function cancelGoodsReceipt(id: string) {
  await requirePermission("gr.edit");
  const supabase = await createClient();

  const { data: gr, error: grError } = await supabase
    .from("goods_receipts")
    .select("*, gr_line_items(*)")
    .eq("id", id)
    .single();

  if (grError) throw grError;

  // If confirmed, reverse the qty updates
  if (gr.status === "confirmed") {
    for (const grLine of gr.gr_line_items) {
      const { data: poLine, error: poLineError } = await supabase
        .from("po_line_items")
        .select("received_qty, remaining_qty, quantity")
        .eq("id", grLine.po_line_item_id)
        .single();

      if (poLineError) throw poLineError;

      const newReceived = Math.max(0, (poLine.received_qty || 0) - Number(grLine.received_qty));
      const newRemaining = poLine.quantity - newReceived;

      const { error: updateError } = await supabase
        .from("po_line_items")
        .update({
          received_qty: newReceived,
          remaining_qty: newRemaining,
        })
        .eq("id", grLine.po_line_item_id);

      if (updateError) throw updateError;
    }
  }

  const { error: statusError } = await supabase
    .from("goods_receipts")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (statusError) throw statusError;

  revalidatePath("/dashboard/gr");
  revalidatePath("/dashboard/po");
  return { success: true };
}
