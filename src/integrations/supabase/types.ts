export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          farmer_id: string
          id: string
          laborer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          farmer_id: string
          id?: string
          laborer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          farmer_id?: string
          id?: string
          laborer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_laborer_id_fkey"
            columns: ["laborer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          crop_category: Database["public"]["Enums"]["crop_category"] | null
          description: string | null
          end_date: string | null
          farmer_id: string
          id: string
          labor_type: Database["public"]["Enums"]["labor_type"] | null
          location: string | null
          pay_rate: number | null
          pay_type: string | null
          start_date: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crop_category?: Database["public"]["Enums"]["crop_category"] | null
          description?: string | null
          end_date?: string | null
          farmer_id: string
          id?: string
          labor_type?: Database["public"]["Enums"]["labor_type"] | null
          location?: string | null
          pay_rate?: number | null
          pay_type?: string | null
          start_date: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crop_category?: Database["public"]["Enums"]["crop_category"] | null
          description?: string | null
          end_date?: string | null
          farmer_id?: string
          id?: string
          labor_type?: Database["public"]["Enums"]["labor_type"] | null
          location?: string | null
          pay_rate?: number | null
          pay_type?: string | null
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      laborer_skills: {
        Row: {
          created_at: string
          crop_category: Database["public"]["Enums"]["crop_category"] | null
          experience_years: number | null
          id: string
          labor_type: Database["public"]["Enums"]["labor_type"] | null
          laborer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crop_category?: Database["public"]["Enums"]["crop_category"] | null
          experience_years?: number | null
          id?: string
          labor_type?: Database["public"]["Enums"]["labor_type"] | null
          laborer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crop_category?: Database["public"]["Enums"]["crop_category"] | null
          experience_years?: number | null
          id?: string
          labor_type?: Database["public"]["Enums"]["labor_type"] | null
          laborer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "laborer_skills_laborer_id_fkey"
            columns: ["laborer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string | null
          read_at: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: Json | null
          created_at: string
          experience: number | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          rating: number | null
          role: string
          skills: Json | null
          updated_at: string
        }
        Insert: {
          availability?: Json | null
          created_at?: string
          experience?: number | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          role: string
          skills?: Json | null
          updated_at?: string
        }
        Update: {
          availability?: Json | null
          created_at?: string
          experience?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          role?: string
          skills?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      crop_category:
        | "paddy"
        | "sugarcane"
        | "cotton"
        | "wheat"
        | "maize"
        | "pulses"
        | "vegetables"
        | "fruits"
        | "horticulture"
        | "spices"
        | "oilseeds"
      labor_type:
        | "harvesting"
        | "sowing"
        | "weeding"
        | "fertilizing"
        | "irrigation"
        | "pesticide_application"
        | "nursery_management"
        | "pruning"
        | "grading"
        | "packaging"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      crop_category: [
        "paddy",
        "sugarcane",
        "cotton",
        "wheat",
        "maize",
        "pulses",
        "vegetables",
        "fruits",
        "horticulture",
        "spices",
        "oilseeds",
      ],
      labor_type: [
        "harvesting",
        "sowing",
        "weeding",
        "fertilizing",
        "irrigation",
        "pesticide_application",
        "nursery_management",
        "pruning",
        "grading",
        "packaging",
      ],
    },
  },
} as const
