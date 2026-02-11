"use client";

import { useMemo } from "react";

export interface FieldControlConfig {
  field_name: string;
  field_label: string;
  is_visible: boolean;
  is_required: boolean;
  is_editable: boolean;
  default_value: string | null;
}

export function useFieldControls(controls: FieldControlConfig[]) {
  const controlMap = useMemo(() => {
    const map = new Map<string, FieldControlConfig>();
    for (const c of controls) {
      map.set(c.field_name, c);
    }
    return map;
  }, [controls]);

  return {
    /** Field is visible (defaults true if no control configured) */
    isVisible: (field: string) => {
      const c = controlMap.get(field);
      return c ? c.is_visible : true;
    },
    /** Field is required (defaults false if no control configured) */
    isRequired: (field: string) => {
      const c = controlMap.get(field);
      return c ? c.is_required : false;
    },
    /** Field is editable (defaults true if no control configured) */
    isEditable: (field: string) => {
      const c = controlMap.get(field);
      return c ? c.is_editable : true;
    },
    /** Get default value for a field */
    getDefault: (field: string) => {
      const c = controlMap.get(field);
      return c?.default_value ?? null;
    },
    /** Get label for a field with fallback */
    getLabel: (field: string, fallback: string) => {
      const c = controlMap.get(field);
      return c?.field_label ?? fallback;
    },
  };
}
