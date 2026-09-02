/*
# Expand platform: avatar, lessons, exams, questions, attempts, chat

## Overview
This migration extends the "ذكاء بالعربي" platform with support for:
- Student profile photos (avatar_url)
- Lessons (created by teacher, viewed by students)
- Exams with multiple-choice questions (created by teacher)
- Exam attempts by students (one attempt per exam, with answer review)
- A live chat between students and the teacher (with auto-reply)

## 1. Modified Tables
- `profiles`
  - ADD `avatar_url` (text, nullable) — URL to the student's profile photo stored in Supabase Storage.

## 2. New Tables

### `lessons`
- `id` (uuid, primary key)
- `title` (text, not null) — lesson title
- `content` (text) — lesson body/description
- `video_url` (text, nullable) — optional external video link
- `created_at` (timestamptz, default now())

### `exams`
- `id` (uuid, primary key)
- `title` (text, not null) — exam title
- `description` (text, nullable)
- `created_at` (timestamptz, default now())

### `questions`
- `id` (uuid, primary key)
- `exam_id` (uuid, FK → exams.id ON DELETE CASCADE)
- `question_text` (text, not null)
- `option_a` (text, not null)
- `option_b` (text, not null)
- `option_c` (text, not null)
- `option_d` (text, not null)
- `correct_answer` (text, not null) — one of 'a','b','c','d'
- `created_at` (timestamptz, default now())

### `attempts`
- `id` (uuid, primary key)
- `exam_id` (uuid, FK → exams.id ON DELETE CASCADE)
- `student_id` (uuid, FK → profiles.id ON DELETE CASCADE)
- `answers` (jsonb) — map of question_id → selected answer ('a'/'b'/'c'/'d')
- `score` (integer) — number of correct answers
- `total` (integer) — total number of questions
- `percentage` (numeric) — score / total * 100
- `created_at` (timestamptz, default now())
- UNIQUE constraint on (exam_id, student_id) — one attempt per exam (prevents retake)

### `chat_messages`
- `id` (uuid, primary key)
- `student_id` (uuid, FK → profiles.id ON DELETE CASCADE)
- `sender` (text, not null) — 'student' or 'teacher'
- `message` (text, not null)
- `created_at` (timestamptz, default now())

## 3. Security
- RLS enabled on all new tables.
- All tables use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because
  this is a lightweight platform with no Supabase Auth — login is handled by matching
  phone + password in the profiles table directly. The anon-key client must read/write all data.
- `profiles` already has anon CRUD policies; the new `avatar_url` column inherits those policies.

## 4. Important Notes
1. The UNIQUE constraint on `attempts (exam_id, student_id)` enforces the "no retake" rule
   at the database level — a second insert for the same student+exam will fail.
2. `attempts.answers` stores the student's selected answers as JSONB for answer review.
3. `attempts.percentage` is calculated client-side at submit time and stored for the honor board.
*/
