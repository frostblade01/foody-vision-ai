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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          bio: string | null
          calorie_goal: number | null
          created_at: string | null
          diet_type: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          calorie_goal?: number | null
          created_at?: string | null
          diet_type?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          calorie_goal?: number | null
          created_at?: string | null
          diet_type?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      recipe_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          recipe_id: string
          recipe_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          recipe_id: string
          recipe_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          recipe_id?: string
          recipe_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "recipe_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_likes: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string
          recipe_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id: string
          recipe_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string
          recipe_type?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_makes: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          recipe_id: string
          recipe_type: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          recipe_id: string
          recipe_type: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          recipe_id?: string
          recipe_type?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          recipe_id: string
          recipe_type: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          recipe_id: string
          recipe_type: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          recipe_id?: string
          recipe_type?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          area: string | null
          category: string | null
          created_at: string | null
          id: string
          recipe_id: string
          recipe_image: string | null
          recipe_name: string
          user_id: string
        }
        Insert: {
          area?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          recipe_id: string
          recipe_image?: string | null
          recipe_name: string
          user_id: string
        }
        Update: {
          area?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          recipe_id?: string
          recipe_image?: string | null
          recipe_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ingredients: {
        Row: {
          added_at: string | null
          id: string
          ingredient_name: string
          quantity: string | null
          unit: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          ingredient_name: string
          quantity?: string | null
          unit?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          ingredient_name?: string
          quantity?: string | null
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_recipes: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string | null
          cook_time: number | null
          cost_per_serving: number | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          fat: number | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: string
          like_count: number | null
          prep_time: number | null
          protein: number | null
          servings: number | null
          sustainability_score: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          cost_per_serving?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients: Json
          instructions: string
          like_count?: number | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          sustainability_score?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          cost_per_serving?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string
          like_count?: number | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          sustainability_score?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
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
