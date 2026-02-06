import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/company-context";
import { formatNumber } from "@/lib/utils/currency";
import { formatDateThai } from "@/lib/utils/date";
import { getWhtLabel } from "@/lib/utils/tax";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const supabase = await createClient();

  // ดึงข้อมูลบริษัทจาก DB แทน YAML
  const companyId = await getActiveCompanyId();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  const baseData = {
    company_name_th: company?.name_th || "",
    company_name_en: company?.name_en || "",
    company_address: company?.address_th || "",
    company_phone: company?.phone || "",
    company_tax_id: company?.tax_id || "",
  };

  let templateFile: string;
  let templateData: Record<string, unknown>;

  try {
    if (type === "pr") {
      templateFile = "pr-template.html";
      const { data: pr } = await supabase
        .from("purchase_requisitions")
        .select("*, profiles!purchase_requisitions_requested_by_fkey(full_name), pr_line_items(*)")
        .eq("id", id)
        .single();

      if (!pr) return NextResponse.json({ error: "PR not found" }, { status: 404 });

      templateData = {
        ...baseData,
        document_number: pr.document_number,
        title: pr.title,
        description: pr.description,
        department: pr.department,
        cost_center: pr.cost_center || "-",
        requested_by: (pr as Record<string, unknown> & { profiles?: { full_name: string } }).profiles?.full_name || "-",
        requested_date: formatDateThai(pr.requested_date),
        required_date: formatDateThai(pr.required_date),
        items: (pr.pr_line_items || [])
          .sort((a, b) => a.line_number - b.line_number)
          .map((item) => ({
            ...item,
            unit_price: formatNumber(item.unit_price),
            amount: formatNumber(item.amount),
          })),
        subtotal: formatNumber(pr.subtotal),
        vat_amount: formatNumber(pr.vat_amount),
        total_amount: formatNumber(pr.total_amount),
        notes: pr.notes,
      };
    } else if (type === "po") {
      templateFile = "po-template.html";
      const { data: po } = await supabase
        .from("purchase_orders")
        .select("*, vendors(*), profiles!purchase_orders_created_by_fkey(full_name), po_line_items(*), purchase_requisitions(document_number)")
        .eq("id", id)
        .single();

      if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });

      const vendor = (po as Record<string, unknown> & { vendors?: Record<string, unknown> }).vendors || {};
      const prRef = (po as Record<string, unknown> & { purchase_requisitions?: { document_number: string } }).purchase_requisitions;

      templateData = {
        ...baseData,
        document_number: po.document_number,
        title: po.title,
        order_date: formatDateThai(po.order_date),
        delivery_date: formatDateThai(po.delivery_date),
        department: po.department,
        payment_term: po.payment_term,
        pr_number: prRef?.document_number || "-",
        vendor_name: (vendor as Record<string, unknown>).name || "-",
        vendor_tax_id: (vendor as Record<string, unknown>).tax_id || "-",
        vendor_address: (vendor as Record<string, unknown>).address || "-",
        vendor_phone: (vendor as Record<string, unknown>).phone || "-",
        vendor_contact: (vendor as Record<string, unknown>).contact_person || "-",
        items: (po.po_line_items || [])
          .sort((a, b) => a.line_number - b.line_number)
          .map((item) => ({
            ...item,
            unit_price: formatNumber(item.unit_price),
            amount: formatNumber(item.amount),
          })),
        subtotal: formatNumber(po.subtotal),
        vat_amount: formatNumber(po.vat_amount),
        total_amount: formatNumber(po.total_amount),
        has_wht: po.wht_type && po.wht_type !== "none",
        wht_label: po.wht_type ? getWhtLabel(po.wht_type) : "",
        wht_amount: formatNumber(po.wht_amount),
        net_amount: formatNumber(po.net_amount),
        notes: po.notes,
      };
    } else if (type === "ap") {
      templateFile = "ap-template.html";
      const { data: ap } = await supabase
        .from("ap_vouchers")
        .select("*, vendors(*), ap_line_items(*), purchase_orders(document_number)")
        .eq("id", id)
        .single();

      if (!ap) return NextResponse.json({ error: "AP not found" }, { status: 404 });

      const vendor = (ap as Record<string, unknown> & { vendors?: Record<string, unknown> }).vendors || {};
      const poRef = (ap as Record<string, unknown> & { purchase_orders?: { document_number: string } }).purchase_orders;

      templateData = {
        ...baseData,
        document_number: ap.document_number,
        title: ap.title,
        voucher_date: formatDateThai(ap.voucher_date),
        due_date: formatDateThai(ap.due_date),
        invoice_number: ap.invoice_number || "-",
        invoice_date: formatDateThai(ap.invoice_date),
        po_number: poRef?.document_number || "-",
        vendor_name: (vendor as Record<string, unknown>).name || "-",
        vendor_tax_id: (vendor as Record<string, unknown>).tax_id || "-",
        vendor_address: (vendor as Record<string, unknown>).address || "-",
        vendor_bank: (vendor as Record<string, unknown>).bank_name || "-",
        vendor_bank_account: `${(vendor as Record<string, unknown>).bank_account_no || "-"} (${(vendor as Record<string, unknown>).bank_account_name || "-"})`,
        items: (ap.ap_line_items || [])
          .sort((a, b) => a.line_number - b.line_number)
          .map((item) => ({
            ...item,
            unit_price: formatNumber(item.unit_price),
            amount: formatNumber(item.amount),
          })),
        subtotal: formatNumber(ap.subtotal),
        vat_amount: formatNumber(ap.vat_amount),
        total_amount: formatNumber(ap.total_amount),
        has_wht: ap.wht_type && ap.wht_type !== "none",
        wht_label: ap.wht_type ? getWhtLabel(ap.wht_type) : "",
        wht_amount: formatNumber(ap.wht_amount),
        net_amount: formatNumber(ap.net_amount),
        checklist: [
          { label: "ใบแจ้งหนี้/ใบกำกับภาษีตัวจริง", checked: ap.check_invoice_original, required: true },
          { label: "สำเนาใบสั่งซื้อ (PO)", checked: ap.check_po_copy, required: true },
          { label: "ใบส่งของ/ใบรับของ", checked: ap.check_delivery_note, required: true },
          { label: "ใบตรวจรับ", checked: ap.check_inspection_report, required: true },
          { label: "ใบกำกับภาษี", checked: ap.check_tax_invoice, required: true },
          { label: "หนังสือรับรองหักภาษี ณ ที่จ่าย", checked: ap.check_wht_cert, required: false },
          { label: "ใบเสร็จรับเงิน", checked: ap.check_receipt, required: false },
          { label: "เอกสารอนุมัติ", checked: ap.check_approval_doc, required: true },
        ],
        notes: ap.notes,
      };
    } else {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    const templatePath = path.join(process.cwd(), "templates", templateFile);
    const templateHtml = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateHtml);
    const html = template(templateData);

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Document render error:", error);
    return NextResponse.json(
      { error: "Failed to render document" },
      { status: 500 }
    );
  }
}
