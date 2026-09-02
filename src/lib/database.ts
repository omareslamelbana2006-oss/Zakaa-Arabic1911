import { supabase, type Lesson, type Exam, type Question, type Attempt, type ChatMessage, type MotivationalQuote } from './supabase';

// ---------- Lessons ----------

export async function fetchLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lesson[];
}

export async function createLesson(title: string, content: string, videoUrl: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({ title, content, video_url: videoUrl || null })
    .select()
    .single();
  if (error) throw error;
  return data as Lesson;
}

export async function deleteLesson(id: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Exams ----------

export async function fetchExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Exam[];
}

export async function createExam(title: string, description: string): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams')
    .insert({ title, description: description || null })
    .select()
    .single();
  if (error) throw error;
  return data as Exam;
}

export async function deleteExam(id: string): Promise<void> {
  const { error } = await supabase.from('exams').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Questions ----------

export async function fetchQuestions(examId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Question[];
}

export interface QuestionInput {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

export async function addQuestion(examId: string, q: QuestionInput): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .insert({ exam_id: examId, ...q })
    .select()
    .single();
  if (error) throw error;
  return data as Question;
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Attempts ----------

export async function fetchAttempt(examId: string, studentId: string): Promise<Attempt | null> {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (error) throw error;
  return data as Attempt | null;
}

export async function fetchStudentAttempts(studentId: string): Promise<Attempt[]> {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Attempt[];
}

export async function fetchAllAttemptsWithStudent(): Promise<(Attempt & { profiles: Profile })[]> {
  const { data, error } = await supabase
    .from('attempts')
    .select('*, profiles!attempts_student_id_fkey(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (Attempt & { profiles: Profile })[];
}

import type { Profile } from './supabase';

export async function submitAttempt(
  examId: string,
  studentId: string,
  answers: Record<string, string>,
  questions: Question[]
): Promise<Attempt> {
  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correct_answer) score++;
  }
  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const { data, error } = await supabase
    .from('attempts')
    .insert({
      exam_id: examId,
      student_id: studentId,
      answers,
      score,
      total,
      percentage,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Attempt;
}

// ---------- Honor Board ----------

export async function fetchHonorBoard(): Promise<(Attempt & { profiles: Profile })[]> {
  const { data, error } = await supabase
    .from('attempts')
    .select('*, profiles!attempts_student_id_fkey(*)')
    .gte('percentage', 90)
    .order('percentage', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (Attempt & { profiles: Profile })[];
}

// ---------- Chat ----------

export async function fetchChatMessages(studentId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function sendChatMessage(studentId: string, message: string): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ student_id: studentId, sender: 'student', message })
    .select()
    .single();
  if (error) throw error;
  // Auto-reply
  await supabase.from('chat_messages').insert({
    student_id: studentId,
    sender: 'teacher',
    message: 'سيتم الرد عليك في أسرع وقت ممكن',
  });
  return data as ChatMessage;
}

export async function fetchAllChats(): Promise<{ student_id: string; profiles: Profile; messages: ChatMessage[] }[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, profiles!chat_messages_student_id_fkey(*)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as (ChatMessage & { profiles: Profile })[];
  const map = new Map<string, { student_id: string; profiles: Profile; messages: ChatMessage[] }>();
  for (const row of rows) {
    const sid = row.student_id;
    if (!map.has(sid)) {
      map.set(sid, { student_id: sid, profiles: row.profiles, messages: [] });
    }
    map.get(sid)!.messages.push(row);
  }
  return Array.from(map.values());
}

export async function teacherReply(studentId: string, message: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .insert({ student_id: studentId, sender: 'teacher', message });
  if (error) throw error;
}

// ---------- Motivational Quotes ----------

export async function fetchMotivationalQuotes(): Promise<MotivationalQuote[]> {
  const { data, error } = await supabase
    .from('motivational_quotes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MotivationalQuote[];
}

export async function getRandomMotivationalQuote(): Promise<MotivationalQuote | null> {
  const quotes = await fetchMotivationalQuotes();
  if (quotes.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
