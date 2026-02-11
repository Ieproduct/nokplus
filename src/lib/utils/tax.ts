// Tax calculation utilities
// WHT is calculated from Subtotal (before VAT)
// Net Payable = Subtotal + VAT - WHT

export type WhtType = "service" | "rent" | "transport" | "none";

const WHT_RATES: Record<WhtType, number> = {
  service: 0.03,
  rent: 0.05,
  transport: 0.01,
  none: 0,
};

const VAT_RATE = 0.07;

export function calculateVat(subtotal: number): number {
  return Math.round(subtotal * VAT_RATE * 100) / 100;
}

export function calculateWht(subtotal: number, whtType: WhtType): number {
  return Math.round(subtotal * (WHT_RATES[whtType] || 0) * 100) / 100;
}

export function calculateNetPayable(
  subtotal: number,
  whtType: WhtType = "none"
): {
  subtotal: number;
  vatAmount: number;
  whtAmount: number;
  totalAmount: number; // subtotal + vat
  netAmount: number; // subtotal + vat - wht
} {
  const vatAmount = calculateVat(subtotal);
  const whtAmount = calculateWht(subtotal, whtType);
  const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;
  const netAmount = Math.round((subtotal + vatAmount - whtAmount) * 100) / 100;

  return { subtotal, vatAmount, whtAmount, totalAmount, netAmount };
}

export function getWhtLabel(whtType: WhtType): string {
  const labels: Record<WhtType, string> = {
    service: "ค่าบริการ (3%)",
    rent: "ค่าเช่า (5%)",
    transport: "ค่าขนส่ง (1%)",
    none: "ไม่หัก WHT",
  };
  return labels[whtType];
}

export function getWhtRate(whtType: WhtType): number {
  return (WHT_RATES[whtType] || 0) * 100;
}

// Dynamic-rate calculation functions (reads from DB tax_configurations)

export function calculateVatFromConfig(subtotal: number, vatRate: number): number {
  return Math.round(subtotal * vatRate * 100) / 100;
}

export function calculateWhtFromConfig(subtotal: number, whtRate: number): number {
  return Math.round(subtotal * whtRate * 100) / 100;
}

export function calculateNetPayableFromConfig(
  subtotal: number,
  vatRate: number,
  whtRate: number
): {
  subtotal: number;
  vatAmount: number;
  whtAmount: number;
  totalAmount: number;
  netAmount: number;
} {
  const vatAmount = calculateVatFromConfig(subtotal, vatRate);
  const whtAmount = calculateWhtFromConfig(subtotal, whtRate);
  const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;
  const netAmount = Math.round((subtotal + vatAmount - whtAmount) * 100) / 100;
  return { subtotal, vatAmount, whtAmount, totalAmount, netAmount };
}
