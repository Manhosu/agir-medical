// Tipos gerados automaticamente pelo Supabase
// Compartilhado com a versão web

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
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          cpf: string | null
          phone: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          cpf?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          cpf?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          status: 'active' | 'canceled' | 'expired' | 'pending'
          plan: string
          starts_at: string
          expires_at: string
          payment_gateway: string | null
          gateway_subscription_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          status?: 'active' | 'canceled' | 'expired' | 'pending'
          plan?: string
          starts_at?: string
          expires_at: string
          payment_gateway?: string | null
          gateway_subscription_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          status?: 'active' | 'canceled' | 'expired' | 'pending'
          plan?: string
          starts_at?: string
          expires_at?: string
          payment_gateway?: string | null
          gateway_subscription_id?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          description: string | null
          cover_url: string | null
          thumbnail_url: string | null
          category: string | null
          is_published: boolean
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          description?: string | null
          cover_url?: string | null
          thumbnail_url?: string | null
          category?: string | null
          is_published?: boolean
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          description?: string | null
          cover_url?: string | null
          thumbnail_url?: string | null
          category?: string | null
          is_published?: boolean
          order?: number
        }
      }
      lessons: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          course_id: string
          title: string
          slug: string
          description: string | null
          order: number
          is_published: boolean
          estimated_time: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          course_id: string
          title: string
          slug: string
          description?: string | null
          order?: number
          is_published?: boolean
          estimated_time?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          course_id?: string
          title?: string
          slug?: string
          description?: string | null
          order?: number
          is_published?: boolean
          estimated_time?: number | null
        }
      }
      lesson_content: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          lesson_id: string
          content_html: string
          original_file_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          lesson_id: string
          content_html: string
          original_file_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          lesson_id?: string
          content_html?: string
          original_file_url?: string | null
        }
      }
      user_progress: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          lesson_id: string
          progress_percent: number
          is_completed: boolean
          last_position: number | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          lesson_id: string
          progress_percent?: number
          is_completed?: boolean
          last_position?: number | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          lesson_id?: string
          progress_percent?: number
          is_completed?: boolean
          last_position?: number | null
          completed_at?: string | null
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
  }
}

// Tipos auxiliares para facilitar o uso
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type LessonContent = Database['public']['Tables']['lesson_content']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
