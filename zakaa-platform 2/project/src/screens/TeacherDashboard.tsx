import { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, ClipboardList, Trophy, MessageCircle, LogOut, Phone, Lock, UserRound, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllStudents } from '@/lib/auth';
import { Avatar } from '@/components/Avatar';
import LessonsScreen from './LessonsScreen';
import ExamsScreen from './ExamsScreen';
import HonorBoardScreen from './HonorBoardScreen';
import TeacherChatScreen from './TeacherChatScreen';
import type { Profile } from '@/lib/supabase';

type Tab = 'students' | 'lessons' | 'exams' | 'honor' | 'chat';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'students', label: 'الطلاب', icon: <Users className="w-4 h-4" /> },
  { id: 'lessons', label: 'الدروس', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'exams', label: 'الامتحانات', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'honor', label: 'لوحة الشرف', icon: <Trophy className="w-4 h-4" /> },
  { id: 'chat', label: 'الرسائل', icon: <MessageCircle className="w-4 h-4" /> },
];

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('students');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} fullName={user?.full_name} subtitle="لوحة المعلم" onLogout={logout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        <div className="mt-6">
          {tab === 'students' && <StudentsTab />}
          {tab === 'lessons' && <LessonsScreen isTeacher={true} />}
          {tab === 'exams' && <ExamsScreen isTeacher={true} />}
          {tab === 'honor' && <HonorBoardScreen />}
          {tab === 'chat' && <TeacherChatScreen />}
        </div>
      </div>
    </div>
  );
}

function StudentsTab() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    fetchAllStudents()
      .then((data) => { if (active) { setStudents(data); setError(''); } })
      .catch(() => { if (active) setError('تعذر تحميل قائمة الطلاب'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = students.filter((s) => s.full_name.includes(search) || s.student_phone.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          الطلاب المسجلون
          <span className="text-sm font-normal text-slate-400">({students.length})</span>
        </h2>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو رقم الهاتف..." className="input-field max-w-md" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm">جاري تحميل الطلاب...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 text-red-500">
          <ShieldAlert className="w-8 h-8 mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <Users className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">{students.length === 0 ? 'لا يوجد طلاب مسجلون بعد' : 'لا توجد نتائج مطابقة'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCard({ student }: { student: Profile }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <Avatar user={student} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 truncate">{student.full_name}</h3>
          <span className="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-1">
            {student.grade_level ?? 'غير محدد'}
          </span>
        </div>
      </div>
      <div className="space-y-2.5 text-sm">
        <InfoRow icon={<Phone className="w-4 h-4" />} label="هاتف الطالب" value={student.student_phone} />
        <InfoRow icon={<Phone className="w-4 h-4" />} label="هاتف ولي الأمر" value={student.guardian_phone || '—'} />
        <div className="flex items-center gap-2 text-slate-600">
          <Lock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-xs">كلمة المرور:</span>
          <span className="font-mono text-xs">{showPassword ? student.password : '••••••••'}</span>
          <button onClick={() => setShowPassword((v) => !v)} className="text-xs text-blue-500 hover:text-blue-600 mr-auto">
            {showPassword ? 'إخفاء' : 'إظهار'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <span className="text-slate-400">{icon}</span>
      <span className="text-slate-400 text-xs">{label}:</span>
      <span className="font-medium text-xs">{value}</span>
    </div>
  );
}

// ---- Shared layout components ----

export function Header({ user, fullName, subtitle, onLogout }: { user: Profile | null; fullName?: string; subtitle: string; onLogout: () => void }) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-600/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">ذكاء بالعربي</h1>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">{fullName}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={fullName} className="w-9 h-9 rounded-full object-cover border-2 border-blue-100" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <UserRound className="w-5 h-5 text-blue-500" />
            </div>
          )}
          <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function TabNav<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string; icon: React.ReactNode }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            active === t.id
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
