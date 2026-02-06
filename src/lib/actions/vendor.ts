"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyId } from "@/lib/company-context";
import type { Database } from "@/lib/types";

export async function getVendors(filters?: {
  q?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();
  let query = supabase.from("vendors").select("*").eq("company_id", companyId);

  if (filters?.q) {
    query = query.or(
      `code.ilike.%${filters.q}%,name.ilike.%${filters.q}%`
    );
  }
  if (filters?.status) {
    query = query.eq(
      "status",
      filters.status as Database["public"]["Enums"]["vendor_status"]
    );
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data;
}

export async function getVendor(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getApprovedVendors() {
  const supabase = await createClient();
  const companyId = await getActiveCompanyId();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createVendor(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const companyId = await getActiveCompanyId();

  const { error } = await supabase.from("vendors").insert({
    company_id: companyId,
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    tax_id: formData.get("tax_id") as string || null,
    address: formData.get("address") as string || null,
    phone: formData.get("phone") as string || null,
    email: formData.get("email") as string || null,
    contact_person: formData.get("contact_person") as string || null,
    payment_term: formData.get("payment_term") as string || "NET30",
    bank_name: formData.get("bank_name") as string || null,
    bank_account_no: formData.get("bank_account_no") as string || null,
    bank_account_name: formData.get("bank_account_name") as string || null,
    status: "pending",
    has_pp20: formData.get("has_pp20") === "on",
    has_company_cert: formData.get("has_company_cert") === "on",
    has_bank_account_copy: formData.get("has_bank_account_copy") === "on",
    has_id_copy: formData.get("has_id_copy") === "on",
    has_vat_cert: formData.get("has_vat_cert") === "on",
    notes: formData.get("notes") as string || null,
    created_by: user.id,
  });

  if (error) throw error;
  revalidatePath("/dashboard/vendors");
  return { success: true };
}

export async function updateVendor(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vendors")
    .update({
      name: formData.get("name") as string,
      tax_id: formData.get("tax_id") as string || null,
      address: formData.get("address") as string || null,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      contact_person: formData.get("contact_person") as string || null,
      payment_term: formData.get("payment_term") as string || "NET30",
      bank_name: formData.get("bank_name") as string || null,
      bank_account_no: formData.get("bank_account_no") as string || null,
      bank_account_name: formData.get("bank_account_name") as string || null,
      status: formData.get("status") as "pending" | "approved" | "suspended" | "blacklisted" || "pending",
      has_pp20: formData.get("has_pp20") === "on",
      has_company_cert: formData.get("has_company_cert") === "on",
      has_bank_account_copy: formData.get("has_bank_account_copy") === "on",
      has_id_copy: formData.get("has_id_copy") === "on",
      has_vat_cert: formData.get("has_vat_cert") === "on",
      notes: formData.get("notes") as string || null,
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/vendors");
  return { success: true };
}
