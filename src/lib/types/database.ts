export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ap_checklist_items: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ap_checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ap_line_items: {
        Row: {
          amount: number
          ap_id: string
          created_at: string | null
          description: string
          gr_line_item_id: string | null
          id: string
          line_number: number
          notes: string | null
          po_line_item_id: string | null
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          amount?: number
          ap_id: string
          created_at?: string | null
          description: string
          gr_line_item_id?: string | null
          id?: string
          line_number: number
          notes?: string | null
          po_line_item_id?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          amount?: number
          ap_id?: string
          created_at?: string | null
          description?: string
          gr_line_item_id?: string | null
          id?: string
          line_number?: number
          notes?: string | null
          po_line_item_id?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ap_line_items_ap_id_fkey"
            columns: ["ap_id"]
            isOneToOne: false
            referencedRelation: "ap_vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_line_items_gr_line_item_id_fkey"
            columns: ["gr_line_item_id"]
            isOneToOne: false
            referencedRelation: "gr_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_line_items_po_line_item_id_fkey"
            columns: ["po_line_item_id"]
            isOneToOne: false
            referencedRelation: "po_line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      ap_vouchers: {
        Row: {
          check_approval_doc: boolean | null
          check_delivery_note: boolean | null
          check_inspection_report: boolean | null
          check_invoice_original: boolean | null
          check_po_copy: boolean | null
          check_receipt: boolean | null
          check_tax_invoice: boolean | null
          check_wht_cert: boolean | null
          company_id: string | null
          cost_center: string | null
          created_at: string | null
          created_by: string
          department: string
          description: string | null
          document_number: string
          due_date: string | null
          gr_id: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          matching_result: Json | null
          matching_status: string | null
          net_amount: number | null
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          po_id: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          subtotal: number | null
          title: string
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
          vendor_id: string
          voucher_date: string | null
          wht_amount: number | null
          wht_type: Database["public"]["Enums"]["wht_type"] | null
        }
        Insert: {
          check_approval_doc?: boolean | null
          check_delivery_note?: boolean | null
          check_inspection_report?: boolean | null
          check_invoice_original?: boolean | null
          check_po_copy?: boolean | null
          check_receipt?: boolean | null
          check_tax_invoice?: boolean | null
          check_wht_cert?: boolean | null
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          created_by: string
          department: string
          description?: string | null
          document_number: string
          due_date?: string | null
          gr_id?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          matching_result?: Json | null
          matching_status?: string | null
          net_amount?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          po_id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vendor_id: string
          voucher_date?: string | null
          wht_amount?: number | null
          wht_type?: Database["public"]["Enums"]["wht_type"] | null
        }
        Update: {
          check_approval_doc?: boolean | null
          check_delivery_note?: boolean | null
          check_inspection_report?: boolean | null
          check_invoice_original?: boolean | null
          check_po_copy?: boolean | null
          check_receipt?: boolean | null
          check_tax_invoice?: boolean | null
          check_wht_cert?: boolean | null
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          created_by?: string
          department?: string
          description?: string | null
          document_number?: string
          due_date?: string | null
          gr_id?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          matching_result?: Json | null
          matching_status?: string | null
          net_amount?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          po_id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vendor_id?: string
          voucher_date?: string | null
          wht_amount?: number | null
          wht_type?: Database["public"]["Enums"]["wht_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "ap_vouchers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_vouchers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_vouchers_gr_id_fkey"
            columns: ["gr_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_vouchers_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_vouchers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_delegations: {
        Row: {
          company_id: string
          created_at: string | null
          delegate_id: string
          delegator_id: string
          document_types: string[] | null
          end_date: string
          id: string
          is_active: boolean
          max_amount: number | null
          reason: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          delegate_id: string
          delegator_id: string
          document_types?: string[] | null
          end_date: string
          id?: string
          is_active?: boolean
          max_amount?: number | null
          reason?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          delegate_id?: string
          delegator_id?: string
          document_types?: string[] | null
          end_date?: string
          id?: string
          is_active?: boolean
          max_amount?: number | null
          reason?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_delegations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_delegations_delegate_id_fkey"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_delegations_delegator_id_fkey"
            columns: ["delegator_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_flow_edges: {
        Row: {
          condition: Json | null
          created_at: string | null
          flow_id: string
          id: string
          label: string | null
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          condition?: Json | null
          created_at?: string | null
          flow_id: string
          id?: string
          label?: string | null
          source_node_id: string
          target_node_id: string
        }
        Update: {
          condition?: Json | null
          created_at?: string | null
          flow_id?: string
          id?: string
          label?: string | null
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_flow_edges_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "approval_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_flow_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "approval_flow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_flow_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "approval_flow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_flow_nodes: {
        Row: {
          config: Json | null
          created_at: string | null
          flow_id: string
          id: string
          label: string
          node_type: Database["public"]["Enums"]["flow_node_type"]
          position_x: number
          position_y: number
          user_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          flow_id: string
          id?: string
          label?: string
          node_type: Database["public"]["Enums"]["flow_node_type"]
          position_x?: number
          position_y?: number
          user_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          flow_id?: string
          id?: string
          label?: string
          node_type?: Database["public"]["Enums"]["flow_node_type"]
          position_x?: number
          position_y?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_flow_nodes_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "approval_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_flows: {
        Row: {
          auto_escalate: boolean
          company_id: string
          conditions: Json | null
          created_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          is_active: boolean
          is_default: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          auto_escalate?: boolean
          company_id: string
          conditions?: Json | null
          created_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          auto_escalate?: boolean
          company_id?: string
          conditions?: Json | null
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_flows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          acted_at: string | null
          action: Database["public"]["Enums"]["approval_action"] | null
          approver_id: string
          comment: string | null
          company_id: string | null
          created_at: string | null
          document_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          step: number
        }
        Insert: {
          acted_at?: string | null
          action?: Database["public"]["Enums"]["approval_action"] | null
          approver_id: string
          comment?: string | null
          company_id?: string | null
          created_at?: string | null
          document_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          step?: number
        }
        Update: {
          acted_at?: string | null
          action?: Database["public"]["Enums"]["approval_action"] | null
          approver_id?: string
          comment?: string | null
          company_id?: string | null
          created_at?: string | null
          document_id?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          step?: number
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_controls: {
        Row: {
          budget_amount: number
          company_id: string
          cost_center_id: string | null
          created_at: string | null
          department_id: string | null
          fiscal_year: number
          id: string
          is_active: boolean
          reserved_amount: number
          updated_at: string | null
          used_amount: number
        }
        Insert: {
          budget_amount?: number
          company_id: string
          cost_center_id?: string | null
          created_at?: string | null
          department_id?: string | null
          fiscal_year: number
          id?: string
          is_active?: boolean
          reserved_amount?: number
          updated_at?: string | null
          used_amount?: number
        }
        Update: {
          budget_amount?: number
          company_id?: string
          cost_center_id?: string | null
          created_at?: string | null
          department_id?: string | null
          fiscal_year?: number
          id?: string
          is_active?: boolean
          reserved_amount?: number
          updated_at?: string | null
          used_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_controls_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_controls_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_controls_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_en: string | null
          address_th: string | null
          created_at: string | null
          email: string | null
          fax: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name_en: string | null
          name_th: string
          phone: string | null
          procurement_contact_email: string | null
          procurement_contact_name: string | null
          procurement_contact_phone: string | null
          procurement_contact_position: string | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_en?: string | null
          address_th?: string | null
          created_at?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name_en?: string | null
          name_th: string
          phone?: string | null
          procurement_contact_email?: string | null
          procurement_contact_name?: string | null
          procurement_contact_phone?: string | null
          procurement_contact_position?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_en?: string | null
          address_th?: string | null
          created_at?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name_en?: string | null
          name_th?: string
          phone?: string | null
          procurement_contact_email?: string | null
          procurement_contact_name?: string | null
          procurement_contact_phone?: string | null
          procurement_contact_position?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string | null
          department_id: string | null
          id: string
          max_approval_amount: number | null
          org_level: number | null
          reports_to_member_id: string | null
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          max_approval_amount?: number | null
          org_level?: number | null
          reports_to_member_id?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          max_approval_amount?: number | null
          org_level?: number | null
          reports_to_member_id?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_reports_to_member_id_fkey"
            columns: ["reports_to_member_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          exchange_rate: number
          id: string
          is_active: boolean
          is_base: boolean
          name: string
          symbol: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          exchange_rate?: number
          id?: string
          is_active?: boolean
          is_base?: boolean
          name: string
          symbol?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          exchange_rate?: number
          id?: string
          is_active?: boolean
          is_base?: boolean
          name?: string
          symbol?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "currencies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          default_cost_center: string | null
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          default_cost_center?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          default_cost_center?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_number_ranges: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          document_type: string
          format: string
          id: string
          is_active: boolean
          next_number: number
          prefix: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          document_type: string
          format: string
          id?: string
          is_active?: boolean
          next_number?: number
          prefix: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          document_type?: string
          format?: string
          id?: string
          is_active?: boolean
          next_number?: number
          prefix?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_number_ranges_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_revisions: {
        Row: {
          changed_at: string | null
          changed_by: string
          changes_json: Json
          document_id: string
          document_type: string
          id: string
          reason: string | null
          revision_number: number
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          changes_json: Json
          document_id: string
          document_type: string
          id?: string
          reason?: string | null
          revision_number?: number
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          changes_json?: Json
          document_id?: string
          document_type?: string
          id?: string
          reason?: string | null
          revision_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_revisions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      field_controls: {
        Row: {
          company_id: string
          created_at: string | null
          default_value: string | null
          document_type: string
          field_label: string
          field_name: string
          id: string
          is_editable: boolean
          is_required: boolean
          is_visible: boolean
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          default_value?: string | null
          document_type: string
          field_label: string
          field_name: string
          id?: string
          is_editable?: boolean
          is_required?: boolean
          is_visible?: boolean
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          default_value?: string | null
          document_type?: string
          field_label?: string
          field_name?: string
          id?: string
          is_editable?: boolean
          is_required?: boolean
          is_visible?: boolean
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_controls_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          company_id: string
          created_at: string | null
          document_number: string
          id: string
          notes: string | null
          po_id: string
          receipt_date: string
          received_by: string
          status: string
          updated_at: string | null
          warehouse: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          document_number: string
          id?: string
          notes?: string | null
          po_id: string
          receipt_date?: string | null
          received_by: string
          status?: string | null
          updated_at?: string | null
          warehouse?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          document_number?: string
          id?: string
          notes?: string | null
          po_id?: string
          receipt_date?: string | null
          received_by?: string
          status?: string | null
          updated_at?: string | null
          warehouse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gr_line_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          gr_id: string
          id: string
          inspection_status: string | null
          line_number: number
          notes: string | null
          po_line_item_id: string
          received_qty: number
          storage_location: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          gr_id: string
          id?: string
          inspection_status?: string | null
          line_number: number
          notes?: string | null
          po_line_item_id: string
          received_qty?: number
          storage_location?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          gr_id?: string
          id?: string
          inspection_status?: string | null
          line_number?: number
          notes?: string | null
          po_line_item_id?: string
          received_qty?: number
          storage_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gr_line_items_gr_id_fkey"
            columns: ["gr_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_line_items_po_line_item_id_fkey"
            columns: ["po_line_item_id"]
            isOneToOne: false
            referencedRelation: "po_line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_rules: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          match_gr: boolean
          match_invoice: boolean
          match_po: boolean
          name: string
          price_tolerance_percent: number | null
          quantity_tolerance_percent: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          match_gr?: boolean
          match_invoice?: boolean
          match_po?: boolean
          name: string
          price_tolerance_percent?: number | null
          quantity_tolerance_percent?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          match_gr?: boolean
          match_invoice?: boolean
          match_po?: boolean
          name?: string
          price_tolerance_percent?: number | null
          quantity_tolerance_percent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          channel: string
          company_id: string
          created_at: string | null
          event_label: string
          event_type: string
          id: string
          is_enabled: boolean
          recipients: string | null
          updated_at: string | null
        }
        Insert: {
          channel?: string
          company_id: string
          created_at?: string | null
          event_label: string
          event_type: string
          id?: string
          is_enabled?: boolean
          recipients?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          company_id?: string
          created_at?: string | null
          event_label?: string
          event_type?: string
          id?: string
          is_enabled?: boolean
          recipients?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_levels: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean
          label_en: string | null
          label_th: string
          level: number
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          label_en?: string | null
          label_th: string
          level: number
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          label_en?: string | null
          label_th?: string
          level?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_levels_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_terms: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          days: number
          description: string | null
          discount_percent: number | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          days?: number
          description?: string | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          days?: number
          description?: string | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_terms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      po_line_items: {
        Row: {
          amount: number
          created_at: string | null
          delivery_date: string | null
          description: string
          id: string
          line_number: number
          material_code: string | null
          notes: string | null
          po_id: string
          pr_line_item_id: string | null
          quantity: number
          received_qty: number | null
          remaining_qty: number | null
          unit: string
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          delivery_date?: string | null
          description: string
          id?: string
          line_number: number
          material_code?: string | null
          notes?: string | null
          po_id: string
          pr_line_item_id?: string | null
          quantity?: number
          received_qty?: number | null
          remaining_qty?: number | null
          unit?: string
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          delivery_date?: string | null
          description?: string
          id?: string
          line_number?: number
          material_code?: string | null
          notes?: string | null
          po_id?: string
          pr_line_item_id?: string | null
          quantity?: number
          received_qty?: number | null
          remaining_qty?: number | null
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "po_line_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_pr_line_item_id_fkey"
            columns: ["pr_line_item_id"]
            isOneToOne: false
            referencedRelation: "pr_line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pr_line_items: {
        Row: {
          amount: number
          created_at: string | null
          delivery_date: string | null
          description: string
          id: string
          line_number: number
          material_code: string | null
          notes: string | null
          pr_id: string
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          delivery_date?: string | null
          description: string
          id?: string
          line_number: number
          material_code?: string | null
          notes?: string | null
          pr_id: string
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          delivery_date?: string | null
          description?: string
          id?: string
          line_number?: number
          material_code?: string | null
          notes?: string | null
          pr_id?: string
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pr_line_items_pr_id_fkey"
            columns: ["pr_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_company_id: string | null
          approval_level: number | null
          created_at: string | null
          department: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          max_approval_amount: number | null
          position: string
          updated_at: string | null
        }
        Insert: {
          active_company_id?: string | null
          approval_level?: number | null
          created_at?: string | null
          department?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          max_approval_amount?: number | null
          position?: string
          updated_at?: string | null
        }
        Update: {
          active_company_id?: string | null
          approval_level?: number | null
          created_at?: string | null
          department?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          max_approval_amount?: number | null
          position?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_company_id_fkey"
            columns: ["active_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          company_id: string | null
          cost_center: string | null
          created_at: string | null
          created_by: string
          currency_code: string | null
          delivery_address: string | null
          delivery_date: string | null
          department: string
          description: string | null
          document_number: string
          exchange_rate: number | null
          gr_required: boolean | null
          id: string
          incoterms: string | null
          net_amount: number | null
          notes: string | null
          order_date: string | null
          payment_term: string | null
          pr_id: string | null
          purchasing_org_id: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          subtotal: number | null
          title: string
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
          vendor_id: string
          wht_amount: number | null
          wht_type: Database["public"]["Enums"]["wht_type"] | null
        }
        Insert: {
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          created_by: string
          currency_code?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          department: string
          description?: string | null
          document_number: string
          exchange_rate?: number | null
          gr_required?: boolean | null
          id?: string
          incoterms?: string | null
          net_amount?: number | null
          notes?: string | null
          order_date?: string | null
          payment_term?: string | null
          pr_id?: string | null
          purchasing_org_id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vendor_id: string
          wht_amount?: number | null
          wht_type?: Database["public"]["Enums"]["wht_type"] | null
        }
        Update: {
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          created_by?: string
          currency_code?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          department?: string
          description?: string | null
          document_number?: string
          exchange_rate?: number | null
          gr_required?: boolean | null
          id?: string
          incoterms?: string | null
          net_amount?: number | null
          notes?: string | null
          order_date?: string | null
          payment_term?: string | null
          pr_id?: string | null
          purchasing_org_id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vendor_id?: string
          wht_amount?: number | null
          wht_type?: Database["public"]["Enums"]["wht_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_pr_id_fkey"
            columns: ["pr_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_purchasing_org_id_fkey"
            columns: ["purchasing_org_id"]
            isOneToOne: false
            referencedRelation: "purchasing_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requisitions: {
        Row: {
          budget_control_id: string | null
          budget_reserved: boolean | null
          company_id: string | null
          cost_center: string | null
          created_at: string | null
          currency_code: string | null
          department: string
          description: string | null
          document_number: string
          id: string
          notes: string | null
          priority: string | null
          purchasing_org_id: string | null
          requested_by: string
          requested_date: string | null
          required_date: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          subtotal: number | null
          title: string
          total_amount: number | null
          updated_at: string | null
          vat_amount: number | null
        }
        Insert: {
          budget_control_id?: string | null
          budget_reserved?: boolean | null
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          currency_code?: string | null
          department: string
          description?: string | null
          document_number: string
          id?: string
          notes?: string | null
          priority?: string | null
          purchasing_org_id?: string | null
          requested_by: string
          requested_date?: string | null
          required_date?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Update: {
          budget_control_id?: string | null
          budget_reserved?: boolean | null
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          currency_code?: string | null
          department?: string
          description?: string | null
          document_number?: string
          id?: string
          notes?: string | null
          priority?: string | null
          purchasing_org_id?: string | null
          requested_by?: string
          requested_date?: string | null
          required_date?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requisitions_budget_control_id_fkey"
            columns: ["budget_control_id"]
            isOneToOne: false
            referencedRelation: "budget_controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_purchasing_org_id_fkey"
            columns: ["purchasing_org_id"]
            isOneToOne: false
            referencedRelation: "purchasing_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchasing_organizations: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchasing_organizations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchasing_organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "purchasing_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string | null
          created_by: string | null
          file_url: string | null
          id: string
          is_selected: boolean | null
          notes: string | null
          pr_id: string
          quotation_date: string | null
          quotation_number: string | null
          total_amount: number | null
          validity_days: number | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          id?: string
          is_selected?: boolean | null
          notes?: string | null
          pr_id: string
          quotation_date?: string | null
          quotation_number?: string | null
          total_amount?: number | null
          validity_days?: number | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          id?: string
          is_selected?: boolean | null
          notes?: string | null
          pr_id?: string
          quotation_date?: string | null
          quotation_number?: string | null
          total_amount?: number | null
          validity_days?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_pr_id_fkey"
            columns: ["pr_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          company_id: string
          created_at: string | null
          granted: boolean
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["company_role"]
        }
        Insert: {
          company_id: string
          created_at?: string | null
          granted?: boolean
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["company_role"]
        }
        Update: {
          company_id?: string
          created_at?: string | null
          granted?: boolean
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["company_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_configurations: {
        Row: {
          calculation_base: string | null
          code: string
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          label: string
          rate: number
          sort_order: number | null
          tax_type: string
          updated_at: string | null
        }
        Insert: {
          calculation_base?: string | null
          code: string
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          rate?: number
          sort_order?: number | null
          tax_type: string
          updated_at?: string | null
        }
        Update: {
          calculation_base?: string | null
          code?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          rate?: number
          sort_order?: number | null
          tax_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_configurations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tolerance_groups: {
        Row: {
          amount_tolerance: number | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_variance_percent: number | null
          quantity_variance_percent: number | null
          updated_at: string | null
        }
        Insert: {
          amount_tolerance?: number | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_variance_percent?: number | null
          quantity_variance_percent?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_tolerance?: number | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_variance_percent?: number | null
          quantity_variance_percent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tolerance_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      units_of_measure: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_of_measure_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permission_overrides: {
        Row: {
          company_id: string
          created_at: string | null
          granted: boolean
          id: string
          permission_key: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          granted: boolean
          id?: string
          permission_key: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          granted?: boolean
          id?: string
          permission_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_document_requirements: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_document_requirements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_groups: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          default_payment_term: string | null
          default_wht_type: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          default_payment_term?: string | null
          default_wht_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          default_payment_term?: string | null
          default_wht_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_no: string | null
          bank_name: string | null
          code: string
          company_id: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          has_bank_account_copy: boolean | null
          has_company_cert: boolean | null
          has_id_copy: boolean | null
          has_pp20: boolean | null
          has_vat_cert: boolean | null
          id: string
          name: string
          notes: string | null
          payment_term: string | null
          phone: string | null
          status: Database["public"]["Enums"]["vendor_status"] | null
          tax_id: string | null
          updated_at: string | null
          vendor_group_id: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_no?: string | null
          bank_name?: string | null
          code: string
          company_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          has_bank_account_copy?: boolean | null
          has_company_cert?: boolean | null
          has_id_copy?: boolean | null
          has_pp20?: boolean | null
          has_vat_cert?: boolean | null
          id?: string
          name: string
          notes?: string | null
          payment_term?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          tax_id?: string | null
          updated_at?: string | null
          vendor_group_id?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_no?: string | null
          bank_name?: string | null
          code?: string
          company_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          has_bank_account_copy?: boolean | null
          has_company_cert?: boolean | null
          has_id_copy?: boolean | null
          has_pp20?: boolean | null
          has_vat_cert?: boolean | null
          id?: string
          name?: string
          notes?: string | null
          payment_term?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          tax_id?: string | null
          updated_at?: string | null
          vendor_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_vendor_group_id_fkey"
            columns: ["vendor_group_id"]
            isOneToOne: false
            referencedRelation: "vendor_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_wht: {
        Args: {
          subtotal: number
          wht_type_param: Database["public"]["Enums"]["wht_type"]
        }
        Returns: number
      }
      check_ap_checklist: { Args: { ap_id_param: string }; Returns: boolean }
      generate_document_number: {
        Args: { doc_prefix: string }
        Returns: string
      }
      is_company_admin: { Args: { p_company_id: string }; Returns: boolean }
      is_company_member: { Args: { p_company_id: string }; Returns: boolean }
      seed_company_permissions: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      seed_organization_levels: {
        Args: { p_company_id: string }
        Returns: undefined
      }
    }
    Enums: {
      approval_action: "approve" | "reject" | "revision"
      company_role: "owner" | "admin" | "member"
      document_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "revision"
        | "cancelled"
        | "completed"
      document_type: "pr" | "po" | "ap"
      flow_node_type: "start" | "approver" | "condition" | "end"
      payment_status: "unpaid" | "partial" | "paid"
      vendor_status: "pending" | "approved" | "suspended" | "blacklisted"
      wht_type: "service" | "rent" | "transport" | "none"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_action: ["approve", "reject", "revision"],
      company_role: ["owner", "admin", "member"],
      document_status: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "revision",
        "cancelled",
        "completed",
      ],
      document_type: ["pr", "po", "ap"],
      flow_node_type: ["start", "approver", "condition", "end"],
      payment_status: ["unpaid", "partial", "paid"],
      vendor_status: ["pending", "approved", "suspended", "blacklisted"],
      wht_type: ["service", "rent", "transport", "none"],
    },
  },
} as const
