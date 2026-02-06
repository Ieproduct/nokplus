import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const configDir = path.join(process.cwd(), "config");

function loadYaml<T>(filename: string): T {
  const filePath = path.join(configDir, filename);
  const fileContents = fs.readFileSync(filePath, "utf8");
  return yaml.load(fileContents) as T;
}

export interface TaxRulesConfig {
  vat: { rate: number; label: string; description: string };
  wht: {
    calculation_base: string;
    types: Array<{
      code: string;
      label: string;
      rate: number;
      description: string;
    }>;
  };
}

export interface DocumentSettingsConfig {
  document_numbering: Record<
    string,
    { prefix: string; format: string; description: string }
  >;
  units: Array<{ code: string; name: string }>;
  payment_terms: Array<{ code: string; name: string; days: number }>;
}

export interface VendorRequirementsConfig {
  vendor_documents: Array<{
    code: string;
    name: string;
    required: boolean;
    description: string;
  }>;
  ap_checklist: Array<{
    code: string;
    name: string;
    required: boolean;
    order: number;
  }>;
  vendor_statuses: Array<{
    code: string;
    name: string;
    color: string;
  }>;
}

export function getTaxRulesConfig(): TaxRulesConfig {
  return loadYaml<TaxRulesConfig>("tax-rules.yaml");
}

export function getDocumentSettingsConfig(): DocumentSettingsConfig {
  return loadYaml<DocumentSettingsConfig>("document-settings.yaml");
}

export function getVendorRequirementsConfig(): VendorRequirementsConfig {
  return loadYaml<VendorRequirementsConfig>("vendor-requirements.yaml");
}
