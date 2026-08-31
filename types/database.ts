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
      admin_users: {
        Row: {
          auth_user_id: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          created_at: string
          division_id: number
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          division_id: number
          id?: number
          is_active?: boolean
          name: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          division_id?: number
          id?: number
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_division_fk"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "districts_division_fk"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "public_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incident_id: string
          reason: Database["public"]["Enums"]["incident_report_reason"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incident_id: string
          reason: Database["public"]["Enums"]["incident_report_reason"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incident_id?: string
          reason?: Database["public"]["Enums"]["incident_report_reason"]
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_incident_fk"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_revisions: {
        Row: {
          category_id: string
          change_reason: string | null
          change_type: Database["public"]["Enums"]["revision_change_type"]
          changed_by: string | null
          created_at: string
          description: string
          district_id: number
          division_id: number
          id: string
          incident_date: string
          incident_id: string
          revision_number: number
          title: string
        }
        Insert: {
          category_id: string
          change_reason?: string | null
          change_type: Database["public"]["Enums"]["revision_change_type"]
          changed_by?: string | null
          created_at?: string
          description: string
          district_id: number
          division_id: number
          id?: string
          incident_date: string
          incident_id: string
          revision_number: number
          title: string
        }
        Update: {
          category_id?: string
          change_reason?: string | null
          change_type?: Database["public"]["Enums"]["revision_change_type"]
          changed_by?: string | null
          created_at?: string
          description?: string
          district_id?: number
          division_id?: number
          id?: string
          incident_date?: string
          incident_id?: string
          revision_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_revisions_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_revisions_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "public_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_revisions_changed_by_fk"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "incident_revisions_district_division_fk"
            columns: ["district_id", "division_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id", "division_id"]
          },
          {
            foreignKeyName: "incident_revisions_district_division_fk"
            columns: ["district_id", "division_id"]
            isOneToOne: false
            referencedRelation: "public_districts"
            referencedColumns: ["id", "division_id"]
          },
          {
            foreignKeyName: "incident_revisions_incident_fk"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          archived_at: string | null
          category_id: string
          created_at: string
          description: string
          district_id: number
          division_id: number
          first_published_at: string | null
          id: string
          incident_date: string
          public_id: string
          published_at: string | null
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          archived_at?: string | null
          category_id: string
          created_at?: string
          description: string
          district_id: number
          division_id: number
          first_published_at?: string | null
          id?: string
          incident_date: string
          public_id: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          archived_at?: string | null
          category_id?: string
          created_at?: string
          description?: string
          district_id?: number
          division_id?: number
          first_published_at?: string | null
          id?: string
          incident_date?: string
          public_id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "incidents_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "public_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_district_division_fk"
            columns: ["district_id", "division_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id", "division_id"]
          },
          {
            foreignKeyName: "incidents_district_division_fk"
            columns: ["district_id", "division_id"]
            isOneToOne: false
            referencedRelation: "public_districts"
            referencedColumns: ["id", "division_id"]
          },
          {
            foreignKeyName: "incidents_division_fk"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_division_fk"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "public_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: Database["public"]["Enums"]["moderation_action_type"]
          actor_id: string
          created_at: string
          from_status: Database["public"]["Enums"]["incident_status"] | null
          id: string
          incident_id: string
          incident_report_id: string | null
          metadata: Json
          reason: string | null
          revision_id: string | null
          to_status: Database["public"]["Enums"]["incident_status"] | null
        }
        Insert: {
          action: Database["public"]["Enums"]["moderation_action_type"]
          actor_id: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["incident_status"] | null
          id?: string
          incident_id: string
          incident_report_id?: string | null
          metadata?: Json
          reason?: string | null
          revision_id?: string | null
          to_status?: Database["public"]["Enums"]["incident_status"] | null
        }
        Update: {
          action?: Database["public"]["Enums"]["moderation_action_type"]
          actor_id?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["incident_status"] | null
          id?: string
          incident_id?: string
          incident_report_id?: string | null
          metadata?: Json
          reason?: string | null
          revision_id?: string | null
          to_status?: Database["public"]["Enums"]["incident_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_actor_fk"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "moderation_actions_incident_fk"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_report_fk"
            columns: ["incident_report_id"]
            isOneToOne: false
            referencedRelation: "incident_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_revision_fk"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "incident_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_categories: {
        Row: {
          description: string | null
          id: string | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      public_districts: {
        Row: {
          division_id: number | null
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          division_id?: number | null
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          division_id?: number | null
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "districts_division_fk"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "districts_division_fk"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "public_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      public_divisions: {
        Row: {
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      public_incidents: {
        Row: {
          category: string | null
          category_slug: string | null
          description: string | null
          district: string | null
          district_slug: string | null
          division: string | null
          division_slug: string | null
          incident_date: string | null
          public_id: string | null
          published_at: string | null
          title: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_change_staff_role: {
        Args: {
          p_auth_user_id: string
          p_role: Database["public"]["Enums"]["admin_role"]
        }
        Returns: undefined
      }
      admin_create_staff: {
        Args: {
          p_auth_user_id: string
          p_display_name: string
          p_role: Database["public"]["Enums"]["admin_role"]
        }
        Returns: string
      }
      admin_deactivate_staff: {
        Args: { p_auth_user_id: string }
        Returns: undefined
      }
      bootstrap_first_admin: {
        Args: { p_auth_user_id: string; p_display_name: string }
        Returns: string
      }
      create_anonymous_incident: {
        Args: {
          p_category_id: string
          p_description: string
          p_district_id: number
          p_division_id: number
          p_incident_date: string
          p_title: string
        }
        Returns: string
      }
      edit_incident: {
        Args: {
          p_category_id: string
          p_description: string
          p_district_id: number
          p_division_id: number
          p_incident_date: string
          p_public_id: string
          p_reason: string
          p_title: string
        }
        Returns: undefined
      }
      moderate_incident_report: {
        Args: {
          p_action: Database["public"]["Enums"]["moderation_action_type"]
          p_reason?: string
          p_report_id: string
        }
        Returns: undefined
      }
      moderate_incident_status: {
        Args: {
          p_public_id: string
          p_reason?: string
          p_to_status: Database["public"]["Enums"]["incident_status"]
        }
        Returns: undefined
      }
      moderate_incident_verification: {
        Args: {
          p_public_id: string
          p_reason?: string
          p_to_status: Database["public"]["Enums"]["verification_status"]
        }
        Returns: undefined
      }
      submit_incident_report: {
        Args: {
          p_description?: string
          p_incident_public_id: string
          p_reason: Database["public"]["Enums"]["incident_report_reason"]
        }
        Returns: string
      }
    }
    Enums: {
      admin_role: "admin" | "moderator"
      incident_report_reason:
        | "false_or_misleading"
        | "privacy_concern"
        | "harmful_content"
        | "duplicate"
        | "wrong_location"
        | "wrong_date"
        | "other"
      incident_status:
        | "pending"
        | "under_review"
        | "needs_revision"
        | "approved"
        | "rejected"
        | "archived"
      moderation_action_type:
        | "incident_edited"
        | "incident_redacted"
        | "status_changed"
        | "verification_changed"
        | "published"
        | "unpublished"
        | "archived"
        | "restored"
        | "report_reviewed"
        | "report_dismissed"
        | "report_action_taken"
      revision_change_type:
        | "submitted"
        | "edited"
        | "redacted"
        | "location_corrected"
        | "category_corrected"
        | "date_corrected"
        | "content_corrected"
        | "restored"
      verification_status:
        | "reported"
        | "partially_verified"
        | "verified"
        | "disputed"
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
    Enums: {
      admin_role: ["admin", "moderator"],
      incident_report_reason: [
        "false_or_misleading",
        "privacy_concern",
        "harmful_content",
        "duplicate",
        "wrong_location",
        "wrong_date",
        "other",
      ],
      incident_status: [
        "pending",
        "under_review",
        "needs_revision",
        "approved",
        "rejected",
        "archived",
      ],
      moderation_action_type: [
        "incident_edited",
        "incident_redacted",
        "status_changed",
        "verification_changed",
        "published",
        "unpublished",
        "archived",
        "restored",
        "report_reviewed",
        "report_dismissed",
        "report_action_taken",
      ],
      revision_change_type: [
        "submitted",
        "edited",
        "redacted",
        "location_corrected",
        "category_corrected",
        "date_corrected",
        "content_corrected",
        "restored",
      ],
      verification_status: [
        "reported",
        "partially_verified",
        "verified",
        "disputed",
      ],
    },
  },
} as const
