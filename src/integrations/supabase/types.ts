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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_calls_log: {
        Row: {
          call_type: string
          case_id: string | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          law_firm_id: string | null
          model: string
          output_tokens: number | null
          success: boolean | null
        }
        Insert: {
          call_type: string
          case_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          law_firm_id?: string | null
          model: string
          output_tokens?: number | null
          success?: boolean | null
        }
        Update: {
          call_type?: string
          case_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          law_firm_id?: string | null
          model?: string
          output_tokens?: number | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_calls_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_calls_log_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      case_deliverables: {
        Row: {
          case_id: string | null
          content: string | null
          deliverable_type: string | null
          error_message: string | null
          generated_at: string | null
          generated_by_model: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          case_id?: string | null
          content?: string | null
          deliverable_type?: string | null
          error_message?: string | null
          generated_at?: string | null
          generated_by_model?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          case_id?: string | null
          content?: string | null
          deliverable_type?: string | null
          error_message?: string | null
          generated_at?: string | null
          generated_by_model?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_deliverables_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_deliverables_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      case_documents: {
        Row: {
          case_id: string | null
          doc_type: string | null
          extracted_data: Json | null
          file_name: string | null
          file_path: string
          file_size: number | null
          id: string
          ocr_extracted_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          case_id?: string | null
          doc_type?: string | null
          extracted_data?: Json | null
          file_name?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          ocr_extracted_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          case_id?: string | null
          doc_type?: string | null
          extracted_data?: Json | null
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          ocr_extracted_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          ai_classification: Json | null
          card_number: string | null
          cid: string | null
          client_cpf: string | null
          client_name: string
          comarca: string | null
          created_at: string | null
          created_by: string | null
          denial_category: string | null
          denial_date: string | null
          denial_reason: string | null
          estimated_damages: number | null
          id: string
          is_draft: boolean | null
          jurimetrics: Json | null
          law_firm_id: string | null
          operadora: string | null
          plan_contracted_at: string | null
          plan_modality: string | null
          prescription_date: string | null
          procedure_requested: string | null
          status: string | null
          success_probability: number | null
          tribunal: string | null
          updated_at: string | null
          urgency: string | null
          vara: string | null
          wizard_step: number | null
        }
        Insert: {
          ai_classification?: Json | null
          card_number?: string | null
          cid?: string | null
          client_cpf?: string | null
          client_name: string
          comarca?: string | null
          created_at?: string | null
          created_by?: string | null
          denial_category?: string | null
          denial_date?: string | null
          denial_reason?: string | null
          estimated_damages?: number | null
          id?: string
          is_draft?: boolean | null
          jurimetrics?: Json | null
          law_firm_id?: string | null
          operadora?: string | null
          plan_contracted_at?: string | null
          plan_modality?: string | null
          prescription_date?: string | null
          procedure_requested?: string | null
          status?: string | null
          success_probability?: number | null
          tribunal?: string | null
          updated_at?: string | null
          urgency?: string | null
          vara?: string | null
          wizard_step?: number | null
        }
        Update: {
          ai_classification?: Json | null
          card_number?: string | null
          cid?: string | null
          client_cpf?: string | null
          client_name?: string
          comarca?: string | null
          created_at?: string | null
          created_by?: string | null
          denial_category?: string | null
          denial_date?: string | null
          denial_reason?: string | null
          estimated_damages?: number | null
          id?: string
          is_draft?: boolean | null
          jurimetrics?: Json | null
          law_firm_id?: string | null
          operadora?: string | null
          plan_contracted_at?: string | null
          plan_modality?: string | null
          prescription_date?: string | null
          procedure_requested?: string | null
          status?: string | null
          success_probability?: number | null
          tribunal?: string | null
          updated_at?: string | null
          urgency?: string | null
          vara?: string | null
          wizard_step?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      law_firms: {
        Row: {
          cnpj: string | null
          created_at: string | null
          id: string
          name: string
          plan: string | null
          trial_ends_at: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      lawyers: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          law_firm_id: string | null
          oab_number: string | null
          oab_state: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          law_firm_id?: string | null
          oab_number?: string | null
          oab_state?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          law_firm_id?: string | null
          oab_number?: string | null
          oab_state?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawyers_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_law_firm_id: { Args: never; Returns: string }
      signup_create_firm: {
        Args: {
          _firm_name: string
          _full_name: string
          _oab_number: string
          _oab_state: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
