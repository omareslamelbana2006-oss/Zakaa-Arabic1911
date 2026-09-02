/*
# Storage policies for avatars bucket

## Overview
Creates a public storage bucket 'avatars' for student profile photos and sets policies
allowing anon+authenticated users to upload, read, and delete avatar images.

## Security
- Public bucket (anyone can read the files via the public URL).
- anon+authenticated can INSERT, SELECT, UPDATE, DELETE objects in the avatars bucket.
*/

-- Bucket already created via execute_sql; ensure policies exist

DROP POLICY IF EXISTS "anon_read_avatars" ON storage.objects;
CREATE POLICY "anon_read_avatars" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "anon_insert_avatars" ON storage.objects;
CREATE POLICY "anon_insert_avatars" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "anon_update_avatars" ON storage.objects;
CREATE POLICY "anon_update_avatars" ON storage.objects FOR UPDATE
  TO anon, authenticated USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "anon_delete_avatars" ON storage.objects;
CREATE POLICY "anon_delete_avatars" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'avatars');
