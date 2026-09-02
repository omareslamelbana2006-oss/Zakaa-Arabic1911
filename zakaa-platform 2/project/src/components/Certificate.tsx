import { Award, Star } from 'lucide-react';
import type { Profile, Attempt } from '@/lib/supabase';

export function Certificate({ student, attempt, examTitle }: { student: Profile; attempt: Attempt; examTitle: string }) {
  const dateStr = new Date(attempt.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl border-2 border-blue-300 shadow-xl overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />

      <div className="relative p-6 sm:p-8 text-center">
        {/* Header */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 mb-3">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-blue-800 mb-1">شهادة تقدير</h2>
        <p className="text-blue-500 text-sm mb-4">منصة ذكاء بالعربي التعليمية</p>

        {/* Body */}
        <p className="text-slate-600 text-sm mb-1">تشهد منصة ذكاء بالعربي بأن الطالب/ة</p>
        <p className="text-2xl font-bold text-slate-800 mb-3">{student.full_name}</p>
        <p className="text-slate-600 text-sm mb-1">قد اجتاز امتحان</p>
        <p className="text-lg font-semibold text-blue-700 mb-3">{examTitle}</p>
        <p className="text-slate-600 text-sm mb-1">بدرجة</p>
        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="text-2xl font-bold text-blue-700">{attempt.percentage}%</span>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-6 pt-4 border-t border-blue-200">
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">معلمة المادة</p>
            <p className="text-sm font-semibold text-slate-700">ذكاء محمد ابراهيم</p>
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-400 mb-1">التوقيع</p>
            <p className="text-sm font-semibold text-slate-700">Eng / Omar Eslam</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">التاريخ: {dateStr}</p>
      </div>
    </div>
  );
}
