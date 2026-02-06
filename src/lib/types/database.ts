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
      ap_line_items: {
        Row: {
          amount: number
          ap_id: string
          created_at: string | null
          description: string
          id: string
          line_number: number
          notes: string | null
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          amount?: number
          ap_id: string
          created_at?: string | null
          description: string
          id?: string
          line_number: number
          notes?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          amount?: number
          ap_id?: string
          created_at?: string | null
          description?: string
          id?: string
          line_number?: number
          notes?: string | null
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
          id: string
          invoice_date: string | null
          invoice_number: string | null
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
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
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
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
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
          company_id: string
          conditions: Json | null
          created_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          conditions?: Json | null
          created_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          conditions?: Json | null
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          is_active?: boolean
          is_default?: boolean
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
          id: string
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
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
      po_line_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          line_number: number
          notes: string | null
          po_id: string
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          description: string
          id?: string
          line_number: number
          notes?: string | null
          po_id: string
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          line_number?: number
          notes?: string | null
          po_id?: string
          quantity?: number
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
        ]
      }
      pr_line_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          line_number: number
          notes: string | null
          pr_id: string
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          description: string
          id?: string
          line_number: number
          notes?: string | null
          pr_id: string
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          line_number?: number
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
          delivery_date: string | null
          department: string
          description: string | null
          document_number: string
          id: string
          net_amount: number | null
          notes: string | null
          order_date: string | null
          payment_term: string | null
          pr_id: string | null
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
          delivery_date?: string | null
          department: string
          description?: string | null
          document_number: string
          id?: string
          net_amount?: number | null
          notes?: string | null
          order_date?: string | null
          payment_term?: string | null
          pr_id?: string | null
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
          delivery_date?: string | null
          department?: string
          description?: string | null
          document_number?: string
          id?: string
          net_amount?: number | null
          notes?: string | null
          order_date?: string | null
          payment_term?: string | null
          pr_id?: string | null
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
          company_id: string | null
          cost_center: string | null
          created_at: string | null
          department: string
          description: string | null
          document_number: string
          id: string
          notes: string | null
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
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          department: string
          description?: string | null
          document_number: string
          id?: string
          notes?: string | null
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
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          department?: string
          description?: string | null
          document_number?: string
          id?: string
          notes?: string | null
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
            foreignKeyName: "purchase_requisitions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
