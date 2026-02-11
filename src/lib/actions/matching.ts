"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Json } from "@/lib/types/database";

interface MatchLineResult {
  po_line_item_id: string;
  description: string;
  po_qty: number;
  gr_qty: number;
  invoice_qty: number;
  po_price: number;
  invoice_price: number;
  qty_variance: number;
  price_variance: number;
  status: "matched" | "within_tolerance" | "exceeded";
}

export async function performThreeWayMatch(apId: string) {
  const supabase = await createClient();

  // Get AP with line items
  const { data: ap, error: apError } = await supabase
    .from("ap_vouchers")
    .select("*, ap_line_items(*), purchase_orders(*, po_line_items(*))")
    .eq("id", apId)
    .single();

  if (apError) throw apError;
  if (!ap.po_id) {
    return { status: "unmatched", message: "ไม่มีใบสั่งซื้ออ้างอิง", lines: [] };
  }

  // Get GR data for this PO
  const { data: grs } = await supabase
    .from("goods_receipts")
    .select("*, gr_line_items(*)")
    .eq("po_id", ap.po_id)
    .eq("status", "confirmed");

  // Get tolerance settings for company
  const { data: tolerances } = await supabase
    .from("tolerance_groups")
    .select("*")
    .eq("company_id", ap.company_id!)
    .eq("is_active", true)
    .limit(1);

  const tolerance = tolerances?.[0] || {
    quantity_variance_percent: 0,
    price_variance_percent: 0,
  };

  const qtyTolerance = (tolerance.quantity_variance_percent || 0) / 100;
  const priceTolerance = (tolerance.price_variance_percent || 0) / 100;

  // Aggregate GR quantities per PO line
  const grQtyByPoLine: Record<string, number> = {};
  for (const gr of grs || []) {
    for (const grLine of gr.gr_line_items) {
      const key = grLine.po_line_item_id;
      grQtyByPoLine[key] = (grQtyByPoLine[key] || 0) + Number(grLine.received_qty);
    }
  }

  // Match each AP line against PO and GR
  const poLines = (ap as any).purchase_orders?.po_line_items || [];
  const poLineMap: Record<string, any> = {};
  for (const poLine of poLines) {
    poLineMap[poLine.id] = poLine;
  }

  const matchLines: MatchLineResult[] = [];
  let overallStatus: "matched" | "tolerance_exceeded" = "matched";

  for (const apLine of ap.ap_line_items) {
    // Try to find corresponding PO line by description match
    const matchingPoLine = poLines.find(
      (pl: any) => pl.description === apLine.description
    );

    if (!matchingPoLine) {
      matchLines.push({
        po_line_item_id: "",
        description: apLine.description,
        po_qty: 0,
        gr_qty: 0,
        invoice_qty: apLine.quantity,
        po_price: 0,
        invoice_price: apLine.unit_price,
        qty_variance: 100,
        price_variance: 100,
        status: "exceeded",
      });
      overallStatus = "tolerance_exceeded";
      continue;
    }

    const grQty = grQtyByPoLine[matchingPoLine.id] || 0;
    const qtyVariance = matchingPoLine.quantity > 0
      ? Math.abs(apLine.quantity - grQty) / matchingPoLine.quantity
      : 0;
    const priceVariance = matchingPoLine.unit_price > 0
      ? Math.abs(apLine.unit_price - matchingPoLine.unit_price) / matchingPoLine.unit_price
      : 0;

    let lineStatus: "matched" | "within_tolerance" | "exceeded" = "matched";
    if (qtyVariance === 0 && priceVariance === 0) {
      lineStatus = "matched";
    } else if (qtyVariance <= qtyTolerance && priceVariance <= priceTolerance) {
      lineStatus = "within_tolerance";
    } else {
      lineStatus = "exceeded";
      overallStatus = "tolerance_exceeded";
    }

    matchLines.push({
      po_line_item_id: matchingPoLine.id,
      description: apLine.description,
      po_qty: matchingPoLine.quantity,
      gr_qty: grQty,
      invoice_qty: apLine.quantity,
      po_price: matchingPoLine.unit_price,
      invoice_price: apLine.unit_price,
      qty_variance: Math.round(qtyVariance * 10000) / 100,
      price_variance: Math.round(priceVariance * 10000) / 100,
      status: lineStatus,
    });
  }

  // Save matching result
  const { error: updateError } = await supabase
    .from("ap_vouchers")
    .update({
      matching_status: overallStatus,
      matching_result: { lines: matchLines, tolerance } as unknown as Json,
    })
    .eq("id", apId);

  if (updateError) throw updateError;

  revalidatePath("/dashboard/ap");
  return { status: overallStatus, lines: matchLines };
}

export async function forceMatch(apId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("ap_vouchers")
    .update({
      matching_status: "force_matched",
      matching_result: {
        force_matched: true,
        force_matched_by: user?.id,
        force_matched_at: new Date().toISOString(),
        reason,
      } as unknown as Json,
    })
    .eq("id", apId);

  if (error) throw error;

  revalidatePath("/dashboard/ap");
  return { success: true };
}
