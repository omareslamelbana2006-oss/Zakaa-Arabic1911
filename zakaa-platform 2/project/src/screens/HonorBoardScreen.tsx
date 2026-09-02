import { useEffect, useState } from 'react';
import { Trophy, Loader2, Star } from 'lucide-react';
import { fetchHonorBoard } from '@/lib/database';
import { Avatar } from '@/components/Avatar';
import type { Attempt, Profile } from '@/lib/supabase';

type HonorEntry = Attempt & { profiles: Profile };

export default function HonorBoardScreen() {
  const [entries, setEntries] = useState<HonorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHonorBoard()
      .then((data) => { setEntries(data); setError(''); })
      .catch(() => setError('تعذر تحميل لوحة الشرف'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        لوحة الشرف
      </h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-slate-400">
          <Trophy className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">لا يوجد طلاب متفوقون بعد</p>
          <p className="text-xs mt-1">يظهر هنا الطلاب الحاصلون على 90% فأكثر</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.id} className={`card p-4 flex items-center gap-3 ${i < 3 ? 'border-amber-200 bg-amber-50/30' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-500'}`}>
                {i + 1}
              </div>
              <Avatar user={entry.profiles} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{entry.profiles.full_name}</p>
                <p className="text-xs text-slate-400">{entry.profiles.grade_level}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-700 text-sm">{entry.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
