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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      classes: {
        Row: {
          category: string
          compatible_models:
            | Database["public"]["Enums"]["thermomix_model"][]
            | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          instructor: string
          is_public: boolean
          is_published: boolean
          long_description: string | null
          pdf_url: string | null
          price: number
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          compatible_models?:
            | Database["public"]["Enums"]["thermomix_model"][]
            | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string
          is_public?: boolean
          is_published?: boolean
          long_description?: string | null
          pdf_url?: string | null
          price?: number
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          compatible_models?:
            | Database["public"]["Enums"]["thermomix_model"][]
            | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string
          is_public?: boolean
          is_published?: boolean
          long_description?: string | null
          pdf_url?: string | null
          price?: number
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      enrolled_classes: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          order_number: string | null
          payment_date: string | null
          payment_method: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          order_number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          order_number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrolled_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          class_id: string
          created_at: string
          duration: string | null
          id: string
          is_free: boolean
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          duration?: string | null
          id?: string
          is_free?: boolean
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          duration?: string | null
          id?: string
          is_free?: boolean
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          food_preferences:
            | Database["public"]["Enums"]["food_preference"][]
            | null
          full_name: string | null
          id: string
          thermomix_model: Database["public"]["Enums"]["thermomix_model"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          food_preferences?:
            | Database["public"]["Enums"]["food_preference"][]
            | null
          full_name?: string | null
          id?: string
          thermomix_model?:
            | Database["public"]["Enums"]["thermomix_model"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          food_preferences?:
            | Database["public"]["Enums"]["food_preference"][]
            | null
          full_name?: string | null
          id?: string
          thermomix_model?:
            | Database["public"]["Enums"]["thermomix_model"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_attempts: {
        Row: {
          created_at: string
          id: string
          items: Json
          order_number: string | null
          session_id: string | null
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          order_number?: string | null
          session_id?: string | null
          total?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          order_number?: string | null
          session_id?: string | null
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      food_preference:
        | "Panadería"
        | "Repostería"
        | "Básicos"
        | "Cocina Práctica"
        | "Vegano"
        | "Vegetariano"
        | "Keto"
        | "Sin Gluten"
        | "Sin Azúcar"
      thermomix_model: "TM31" | "TM5" | "TM6" | "TM7"
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
      app_role: ["admin", "moderator", "user"],
      food_preference: [
        "Panadería",
        "Repostería",
        "Básicos",
        "Cocina Práctica",
        "Vegano",
        "Vegetariano",
        "Keto",
        "Sin Gluten",
        "Sin Azúcar",
      ],
      thermomix_model: ["TM31", "TM5", "TM6", "TM7"],
    },
  },
} as const
