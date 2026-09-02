/*
# Add motivational quotes table

## Overview
Creates a table for motivational quotes that can be displayed to students
on their dashboard. This allows for dynamic quotes that can be managed
through the database.

## New Table: motivational_quotes
- id (uuid, primary key)
- quote_text (text, not null) - the motivational quote in Arabic
- is_active (boolean, default true) - whether the quote is currently active
- created_at (timestamptz, default now())

## Security
RLS enabled with anon+authenticated CRUD policies following the platform's
pattern of allowing anon-key access.
*/

-- Create motivational_quotes table
CREATE TABLE IF NOT EXISTS motivational_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;

-- Policies for motivational_quotes
DROP POLICY IF EXISTS "anon_select_motivational_quotes" ON motivational_quotes;
CREATE POLICY "anon_select_motivational_quotes" ON motivational_quotes 
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_motivational_quotes" ON motivational_quotes;
CREATE POLICY "anon_insert_motivational_quotes" ON motivational_quotes 
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_motivational_quotes" ON motivational_quotes;
CREATE POLICY "anon_update_motivational_quotes" ON motivational_quotes 
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_motivational_quotes" ON motivational_quotes;
CREATE POLICY "anon_delete_motivational_quotes" ON motivational_quotes 
FOR DELETE TO anon, authenticated USING (true);

-- Insert the motivational quotes
INSERT INTO motivational_quotes (quote_text) VALUES
('النجاح ليس صدفة، بل هو ثمرة التعب والإصرار اليومي.'),
('كل خطوة تخطوها اليوم في طريق العلم تقربك خطوة نحو أحلامك الكبيرة.'),
('العقل كالعضلة، كلما دربته بالقراءة والتعلم، كلما أصبح أقوى وأكثر مرونة.'),
('لا تخف من الفشل، فهو ببساطة البداية الذكية لتعلم كيف تنجح بشكل صحيح.'),
('وقتك هو أغلى ما تملك، استثمره بحكمة في كتاب يضيف لك أو مهارة ترفع من شأنك.'),
('التميز الدراسي ليس حكراً على أحد، بل هو لمن يملك الشغف والصبر للوصول.'),
('اجعل شغفك بالتعلم أقوى من أي صعوبة تواجهك في مناهجك أو اختباراتك.'),
('المستقبل يبتسم لمن يستعد له اليوم بجد واكتشاف وجهد صادق.'),
('الأحلام الكبيرة تحتاج إلى جهود عظيمة، فلا تبخل على نفسك بالعمل الجاد.'),
('الصعوبات الدراسية التي تواجهها اليوم ستصبح قصص نجاح تفتخر بها غداً.'),
('التركيز والانضباط هما الجسر الحقيقي الذي يعبر بك من قاعات الدراسة إلى قمم النجاح.'),
('لا تسأل كم تبقى من الجهد، بل انظر إلى ما أنجزته وإلى ما أنت قادر على تحقيقه.'),
('العلم نور، وكل معلومة جديدة تكتسبها تضيء زاوية جديدة في عقلك وحياتك.'),
('النجاح الحقيقي هو أن تتفوق اليوم على نفسك فيما كنت عليه بالأمس.'),
('اجعل طموحك بلا حدود، وعزيمتك أصلب من أي عقبة تقف في طريقك.'),
('القراءة الواعية والبحث المستمر هما مفتاحا التفوق والإبداع المستدام.'),
('لا تؤجل عمل اليوم إلى غدٍ، فالإنجاز المبكر يمنحك راحة البال وقوة التركيز.'),
('ثقتك بقدرتك على التعلم والتطور هي نصف طريق التفوق الدراسي.'),
('كل ساعة تقضيها في المذاكرة والاجتهاد هي استثمار مضمون في مستقبلك.'),
('اصنع لنفسك هدفاً واضحاً، واسعَ إليه بكل ما أوتيت من عزم وإرادة.')
ON CONFLICT DO NOTHING;