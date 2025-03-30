export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      assets: {
        Row: {
          id: string
          user_id: string
          symbol: string
          name: string
          quantity: number
          purchase_price: number
          current_price: number
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          name: string
          quantity: number
          purchase_price: number
          current_price: number
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          name?: string
          quantity?: number
          purchase_price?: number
          current_price?: number
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          asset_id: string | null
          symbol: string
          type: string
          quantity: number
          price: number
          timestamp: string
          total: number
          fee: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          asset_id?: string | null
          symbol: string
          type: string
          quantity: number
          price: number
          timestamp?: string
          total: number
          fee?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string | null
          symbol?: string
          type?: string
          quantity?: number
          price?: number
          timestamp?: string
          total?: number
          fee?: number | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_asset_id_fkey"
            columns: ["asset_id"]
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          asset: string
          condition: string
          value: number
          active: boolean | null
          triggered: boolean | null
          created_at: string
          triggered_at: string | null
          repeat: boolean | null
          notification_type: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          asset: string
          condition: string
          value: number
          active?: boolean | null
          triggered?: boolean | null
          created_at?: string
          triggered_at?: string | null
          repeat?: boolean | null
          notification_type?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          asset?: string
          condition?: string
          value?: number
          active?: boolean | null
          triggered?: boolean | null
          created_at?: string
          triggered_at?: string | null
          repeat?: boolean | null
          notification_type?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_threads: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          is_read: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
          is_read?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
          is_read?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          thread_id: string
          content: string
          sender: string
          timestamp: string
        }
        Insert: {
          id?: string
          thread_id: string
          content: string
          sender: string
          timestamp?: string
        }
        Update: {
          id?: string
          thread_id?: string
          content?: string
          sender?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          }
        ]
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