/*
# Create profiles table for "ذكاء بالعربي" educational platform

1. New Tables
- `profiles`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `full_name` (text, full three-part student name)
  - `student_phone` (text, unique, student phone number used as login identifier)
  - `guardian_phone` (text, guardian phone number)
  - `password` (text, plain password stored for this lightweight app)
  - `role` (text, 'teacher' | 'student' — account type)
  - `grade_level` (text, student's grade/level)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `profiles`.
- Allow anon + authenticated CRUD: this is a lightweight platform with no Supabase Auth sign-in.
  Login is handled by matching student_phone + password against rows directly, so the
  anon-key client must be able to read and write profiles.

3. Important notes
- Only ONE teacher account is allowed. The frontend enforces this by checking for an
  existing teacher row before allowing a new teacher registration.
- Login is performed by querying profiles by student_phone + password, not via Supabase Auth.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  student_phone text NOT NULL UNIQUE,
  guardian_phone text,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'student')),
  grade_level text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);
