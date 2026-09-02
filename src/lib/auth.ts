import { supabase, type Profile, type Role } from './supabase';

const STORAGE_KEY = 'thakaa_user';

export function getStoredUser(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function setStoredUser(user: Profile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export interface StudentSignUpInput {
  full_name: string;
  student_phone: string;
  guardian_phone: string;
  password: string;
  grade_level: string;
  avatar_url: string | null;
}

export interface TeacherSignUpInput {
  full_name: string;
  student_phone: string;
  password: string;
}

export async function teacherExists(): Promise<boolean> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'teacher');
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function signUpStudent(input: StudentSignUpInput): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      full_name: input.full_name,
      student_phone: input.student_phone,
      guardian_phone: input.guardian_phone,
      password: input.password,
      role: 'student' as Role,
      grade_level: input.grade_level,
      avatar_url: input.avatar_url,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function signUpTeacher(input: TeacherSignUpInput): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      full_name: input.full_name,
      student_phone: input.student_phone,
      guardian_phone: null,
      password: input.password,
      role: 'teacher' as Role,
      grade_level: null,
      avatar_url: null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function signIn(phone: string, password: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('student_phone', phone)
    .eq('password', password)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة');
  return data as Profile;
}

export async function fetchAllStudents(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `avatar-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return urlData.publicUrl;
}
