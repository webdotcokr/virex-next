import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          part_number: string
          category_id: number
          maker_id: number
          series_id: number | null
          specifications: Record<string, any> | null
          is_active: boolean
          is_new: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          part_number: string
          category_id: number
          maker_id: number
          series_id?: number | null
          specifications?: Record<string, any> | null
          is_active?: boolean
          is_new?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          part_number?: string
          category_id?: number
          maker_id?: number
          series_id?: number | null
          specifications?: Record<string, any> | null
          is_active?: boolean
          is_new?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          parent_id: number | null
          slug: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          parent_id?: number | null
          slug?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          parent_id?: number | null
          slug?: string | null
          description?: string | null
          created_at?: string
        }
      }
      makers: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      series: {
        Row: {
          id: number
          series_name: string
          category_id: number | null
          intro_text: string | null
          short_text: string | null
          youtube_url: string | null
          feature_image_url: string | null
          feature_title_1: string | null
          feature_desc_1: string | null
          feature_title_2: string | null
          feature_desc_2: string | null
          feature_title_3: string | null
          feature_desc_3: string | null
          feature_title_4: string | null
          feature_desc_4: string | null
          strength_1: string | null
          strength_2: string | null
          strength_3: string | null
          strength_4: string | null
          strength_5: string | null
          strength_6: string | null
          app_title_1: string | null
          app_image_1: string | null
          app_title_2: string | null
          app_image_2: string | null
          app_title_3: string | null
          app_image_3: string | null
          app_title_4: string | null
          app_image_4: string | null
          text_title_1: string | null
          text_desc_1: string | null
          text_image_url_1: string | null
          text_title_2: string | null
          text_desc_2: string | null
          text_image_url_2: string | null
          text_title_3: string | null
          text_desc_3: string | null
          text_image_url_3: string | null
          text_title_4: string | null
          text_desc_4: string | null
          text_image_url_4: string | null
          text_title_5: string | null
          text_desc_5: string | null
          text_image_url_5: string | null
          created_at: string
        }
        Insert: {
          id?: number
          series_name: string
          category_id?: number | null
          intro_text?: string | null
          short_text?: string | null
          youtube_url?: string | null
          feature_image_url?: string | null
          feature_title_1?: string | null
          feature_desc_1?: string | null
          feature_title_2?: string | null
          feature_desc_2?: string | null
          feature_title_3?: string | null
          feature_desc_3?: string | null
          feature_title_4?: string | null
          feature_desc_4?: string | null
          strength_1?: string | null
          strength_2?: string | null
          strength_3?: string | null
          strength_4?: string | null
          strength_5?: string | null
          strength_6?: string | null
          app_title_1?: string | null
          app_image_1?: string | null
          app_title_2?: string | null
          app_image_2?: string | null
          app_title_3?: string | null
          app_image_3?: string | null
          app_title_4?: string | null
          app_image_4?: string | null
          text_title_1?: string | null
          text_desc_1?: string | null
          text_image_url_1?: string | null
          text_title_2?: string | null
          text_desc_2?: string | null
          text_image_url_2?: string | null
          text_title_3?: string | null
          text_desc_3?: string | null
          text_image_url_3?: string | null
          text_title_4?: string | null
          text_desc_4?: string | null
          text_image_url_4?: string | null
          text_title_5?: string | null
          text_desc_5?: string | null
          text_image_url_5?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          series_name?: string
          category_id?: number | null
          intro_text?: string | null
          short_text?: string | null
          youtube_url?: string | null
          feature_image_url?: string | null
          feature_title_1?: string | null
          feature_desc_1?: string | null
          feature_title_2?: string | null
          feature_desc_2?: string | null
          feature_title_3?: string | null
          feature_desc_3?: string | null
          feature_title_4?: string | null
          feature_desc_4?: string | null
          strength_1?: string | null
          strength_2?: string | null
          strength_3?: string | null
          strength_4?: string | null
          strength_5?: string | null
          strength_6?: string | null
          app_title_1?: string | null
          app_image_1?: string | null
          app_title_2?: string | null
          app_image_2?: string | null
          app_title_3?: string | null
          app_image_3?: string | null
          app_title_4?: string | null
          app_image_4?: string | null
          text_title_1?: string | null
          text_desc_1?: string | null
          text_image_url_1?: string | null
          text_title_2?: string | null
          text_desc_2?: string | null
          text_image_url_2?: string | null
          text_title_3?: string | null
          text_desc_3?: string | null
          text_image_url_3?: string | null
          text_title_4?: string | null
          text_desc_4?: string | null
          text_image_url_4?: string | null
          text_title_5?: string | null
          text_desc_5?: string | null
          text_image_url_5?: string | null
          created_at?: string
        }
      }
      product_media: {
        Row: {
          id: number
          product_id: number
          url: string
          media_type: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          url: string
          media_type: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          url?: string
          media_type?: string
          is_primary?: boolean
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
      inquiries: {
        Row: {
          id: string
          product_id: string | null
          name: string
          email: string
          company: string | null
          phone: string | null
          message: string | null
          status: string | null
          created_at: string | null
          inquiry_type: string | null
          job_title: string | null
          contact_path: string | null
          product_name: string | null
          attachment_url: string | null
          description: string | null
          privacy_agreed: boolean | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          name: string
          email: string
          company?: string | null
          phone?: string | null
          message?: string | null
          status?: string | null
          created_at?: string | null
          inquiry_type?: string | null
          job_title?: string | null
          contact_path?: string | null
          product_name?: string | null
          attachment_url?: string | null
          description?: string | null
          privacy_agreed?: boolean | null
        }
        Update: {
          id?: string
          product_id?: string | null
          name?: string
          email?: string
          company?: string | null
          phone?: string | null
          message?: string | null
          status?: string | null
          created_at?: string | null
          inquiry_type?: string | null
          job_title?: string | null
          contact_path?: string | null
          product_name?: string | null
          attachment_url?: string | null
          description?: string | null
          privacy_agreed?: boolean | null
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