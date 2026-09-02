import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Role = 'teacher' | 'student';

export interface Profile {
  id: string;
  full_name: string;
  student_phone: string;
  guardian_phone: string | null;
  password: string;
  role: Role;
  grade_level: string | null;
  avatar_url: string | null;
  created_at?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  created_at: string;
}

export interface Attempt {
  id: string;
  exam_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  total: number;
  percentage: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  student_id: string;
  sender: 'student' | 'teacher';
  message: string;
  created_at: string;
}
