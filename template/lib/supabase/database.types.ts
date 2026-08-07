export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string
          id: string
          meta: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          meta?: Json
        }
        Relationships: []
      }
      batches: {
        Row: {
          created_at: string
          id: string
          location_id: string
          name: string
          season_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          name: string
          season_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          name?: string
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      db_meta: {
        Row: {
          applied_at: string
          checksum: string
          filename: string
          name: string
          version: string
        }
        Insert: {
          applied_at?: string
          checksum: string
          filename: string
          name: string
          version: string
        }
        Update: {
          applied_at?: string
          checksum?: string
          filename?: string
          name?: string
          version?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string
          id: string
          name: string
          phone_number: string | null
          registration_id: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone_number?: string | null
          registration_id: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone_number?: string | null
          registration_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          amount_paid: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_id: string
          fee_amount: number | null
          id: string
          location_id: string | null
          registrant_name: string
          registrant_phone: string | null
          remarks: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id: string
          fee_amount?: number | null
          id?: string
          location_id?: string | null
          registrant_name: string
          registrant_phone?: string | null
          remarks?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: string
          fee_amount?: number | null
          id?: string
          location_id?: string | null
          registrant_name?: string
          registrant_phone?: string | null
          remarks?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string | null
          id: string
          name: string
          public_registration_enabled: boolean
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date?: string | null
          id?: string
          name: string
          public_registration_enabled?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string | null
          id?: string
          name?: string
          public_registration_enabled?: boolean
        }
        Relationships: []
      }
      example_widget: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          label: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      navratri_registrations: {
        Row: {
          amount_paid: number
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          pass_count: number
          price_per_pass: number
          remarks: string | null
          representative_name: string
          representative_phone: string
          total_amount: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          pass_count: number
          price_per_pass: number
          remarks?: string | null
          representative_name: string
          representative_phone: string
          total_amount: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          pass_count?: number
          price_per_pass?: number
          remarks?: string | null
          representative_name?: string
          representative_phone?: string
          total_amount?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          cash_amount: number | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          mode: string
          paid_date: string
          payment_type: string
          remarks: string | null
          student_id: string
          upi_amount: number | null
        }
        Insert: {
          amount: number
          cash_amount?: number | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          mode: string
          paid_date: string
          payment_type?: string
          remarks?: string | null
          student_id: string
          upi_amount?: number | null
        }
        Update: {
          amount?: number
          cash_amount?: number | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          mode?: string
          paid_date?: string
          payment_type?: string
          remarks?: string | null
          student_id?: string
          upi_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_current: boolean
          label: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          label: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          label?: string
          start_date?: string | null
        }
        Relationships: []
      }
      staff_roles: {
        Row: {
          created_at: string
          location_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          location_id?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          location_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_roles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          batch_id: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          demo_fee_amount: number | null
          fee_total: number | null
          id: string
          inquiry_date: string | null
          is_lead: boolean
          location_id: string | null
          name: string
          phone_number: string
          remarks: string | null
          season_id: string
          source: string | null
          source_detail: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          whatsapp_number: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          demo_fee_amount?: number | null
          fee_total?: number | null
          id?: string
          inquiry_date?: string | null
          is_lead?: boolean
          location_id?: string | null
          name: string
          phone_number: string
          remarks?: string | null
          season_id: string
          source?: string | null
          source_detail?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          demo_fee_amount?: number | null
          fee_total?: number | null
          id?: string
          inquiry_date?: string | null
          is_lead?: boolean
          location_id?: string | null
          name?: string
          phone_number?: string
          remarks?: string | null
          season_id?: string
          source?: string | null
          source_detail?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_lead: {
        Args: { p_location_id: string; p_student_id: string }
        Returns: undefined
      }
      is_super_admin: { Args: never; Returns: boolean }
      is_triage_admin: { Args: never; Returns: boolean }
      joined_headcount_by_batch: {
        Args: { p_season_id?: string }
        Returns: {
          batch_id: string
          headcount: number
          location_id: string
        }[]
      }
      keepalive: { Args: never; Returns: string }
      lead_log: {
        Args: { p_season_id?: string }
        Returns: {
          id: string
          location_id: string
          name: string
          phone_number: string
          remarks: string
          source: string
          status: string
          whatsapp_number: string
        }[]
      }
      staff_location_id: { Args: never; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

