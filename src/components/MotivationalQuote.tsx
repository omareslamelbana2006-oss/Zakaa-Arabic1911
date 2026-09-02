import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getRandomMotivationalQuote } from '@/lib/database';

const FALLBACK_QUOTES = [
  'النجاح ليس صدفة، بل هو ثمرة التعب والإصرار اليومي.',
  'كل خطوة تخطوها اليوم في طريق العلم تقربك خطوة نحو أحلامك الكبيرة.',
  'العقل كالعضلة، كلما دربته بالقراءة والتعلم، كلما أصبح أقوى وأكثر مرونة.',
  'لا تخف من الفشل، فهو ببساطة البداية الذكية لتعلم كيف تنجح بشكل صحيح.',
  'وقتك هو أغلى ما تملك، استثمره بحكمة في كتاب يضيف لك أو مهارة ترفع من شأنك.',
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState<string>(() => 
    FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuote() {
      try {
        const randomQuote = await getRandomMotivationalQuote();
        if (randomQuote) {
          setQuote(randomQuote.quote_text);
        }
      } catch (error) {
        console.error('Failed to load motivational quote:', error);
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-l from-amber-50 via-white to-sky-50 p-5 text-center shadow-sm">
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-amber-200/30" aria-hidden="true" />
      <div className="relative flex items-start justify-center gap-2 text-amber-700">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="text-sm font-semibold leading-7">
          {loading ? 'جاري التحميل...' : quote}
        </p>
      </div>
    </section>
  );
}