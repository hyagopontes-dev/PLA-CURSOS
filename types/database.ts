export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      courses: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          thumbnail_url: string | null
          price_cents: number
          status: 'draft' | 'published'
          instructor_name: string
          instructor_bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          order_index: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['modules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content_type: 'video' | 'pdf' | 'text'
          video_url: string | null
          pdf_url: string | null
          content_md: string | null
          order_index: number
          duration_seconds: number | null
          is_preview: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
          question: string
          options: string[]
          correct_index: number
          explanation: string | null
          order_index: number
        }
        Insert: Omit<Database['public']['Tables']['quizzes']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['quizzes']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          paid_at: string | null
          payment_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          watched_seconds: number
          quiz_score: number | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lesson_progress']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lesson_progress']['Insert']>
      }
      payments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          stripe_session_id: string
          stripe_payment_intent: string | null
          amount_cents: number
          status: 'pending' | 'paid' | 'refunded' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Module = Database['public']['Tables']['modules']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Quiz = Database['public']['Tables']['quizzes']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

export type CourseWithModules = Course & {
  modules: (Module & { lessons: Lesson[] })[]
}

export type LessonWithQuiz = Lesson & {
  quizzes: Quiz[]
  module: Module & { course: Course }
}
