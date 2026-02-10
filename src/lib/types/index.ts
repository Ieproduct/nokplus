import type { Tables } from "./database";
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "./database";

// Convenience type aliases
export type Profile = Tables<"profiles">;
export type Vendor = Tables<"vendors">;
export type PurchaseRequisition = Tables<"purchase_requisitions">;
export type PrLineItem = Tables<"pr_line_items">;
export type PurchaseOrder = Tables<"purchase_orders">;
export type PoLineItem = Tables<"po_line_items">;
export type ApVoucher = Tables<"ap_vouchers">;
export type ApLineItem = Tables<"ap_line_items">;
export type Quotation = Tables<"quotations">;
export type Approval = Tables<"approvals">;
export type AuditLog = Tables<"audit_log">;

// Multi-company types
export type Company = Tables<"companies">;
export type CompanyMember = Tables<"company_members">;
export type Department = Tables<"departments">;
export type CostCenter = Tables<"cost_centers">;

// Organization types
export type OrganizationLevel = Tables<"organization_levels">;

// Approval flow types
export type ApprovalFlow = Tables<"approval_flows">;
export type ApprovalFlowNode = Tables<"approval_flow_nodes">;
export type ApprovalFlowEdge = Tables<"approval_flow_edges">;

// Permission types
export type RolePermission = Tables<"role_permissions">;
export type UserPermissionOverride = Tables<"user_permission_overrides">;

// Status labels in Thai
export const STATUS_LABELS: Record<string, string> = {
  draft: "ร่าง",
  pending_approval: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธ",
  revision: "แก้ไข",
  cancelled: "ยกเลิก",
  completed: "เสร็จสิ้น",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "ยังไม่จ่าย",
  partial: "จ่ายบางส่วน",
  paid: "จ่ายแล้ว",
};

export const VENDOR_STATUS_LABELS: Record<string, string> = {
  pending: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  suspended: "ระงับชั่วคราว",
  blacklisted: "ขึ้นบัญชีดำ",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision: "bg-orange-100 text-orange-800",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-800",
  unpaid: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
  blacklisted: "bg-gray-100 text-gray-500",
};
