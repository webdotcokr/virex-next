import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          partnumber: string
          series: string
          name: string
          description: string | null
          category_id: string
          is_new: boolean
          image_url: string | null
          datasheet_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partnumber: string
          series: string
          name: string
          description?: string | null
          category_id: string
          is_new?: boolean
          image_url?: string | null
          datasheet_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partnumber?: string
          series?: string
          name?: string
          description?: string | null
          category_id?: string
          is_new?: boolean
          image_url?: string | null
          datasheet_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      product_parameters: {
        Row: {
          id: string
          product_id: string
          parameter_name: string
          parameter_value: string
          parameter_type: 'text' | 'number' | 'boolean' | 'select'
          display_order: number
          is_filterable: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          parameter_name: string
          parameter_value: string
          parameter_type: 'text' | 'number' | 'boolean' | 'select'
          display_order?: number
          is_filterable?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          parameter_name?: string
          parameter_value?: string
          parameter_type?: 'text' | 'number' | 'boolean' | 'select'
          display_order?: number
          is_filterable?: boolean
          created_at?: string
        }
      }
      news: {
        Row: {
          id: number
          title: string
          content: string
          view_count: number | null
          is_featured: boolean | null
          thumbnail_url: string | null
          category_id: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          title: string
          content: string
          view_count?: number | null
          is_featured?: boolean | null
          thumbnail_url?: string | null
          category_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          content?: string
          view_count?: number | null
          is_featured?: boolean | null
          thumbnail_url?: string | null
          category_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      new_products: {
        Row: {
          id: number
          img_url: string
          title: string
          description: string | null
          link_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          img_url: string
          title: string
          description?: string | null
          link_url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          img_url?: string
          title?: string
          description?: string | null
          link_url?: string
          sort_order?: number
          created_at?: string
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          is_active?: boolean
        }
      }
      download_categories: {
        Row: {
          id: number
          name: string
          is_member_only: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          is_member_only?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          is_member_only?: boolean
          created_at?: string
        }
      }
      downloads: {
        Row: {
          id: number
          category_id: number
          title: string
          file_name: string | null
          file_url: string
          hit_count: number
          created_at: string
        }
        Insert: {
          id?: number
          category_id: number
          title: string
          file_name?: string | null
          file_url: string
          hit_count?: number
          created_at?: string
        }
        Update: {
          id?: number
          category_id?: number
          title?: string
          file_name?: string | null
          file_url?: string
          hit_count?: number
          created_at?: string
        }
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