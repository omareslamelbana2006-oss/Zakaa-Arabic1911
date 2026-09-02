import { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, ClipboardList, Trophy, MessageCircle, LogOut, Phone, Lock, UserRound, Loader2, ShieldAlert, Moon, Sun, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllStudents } from '@/lib/auth';
import { fetchStudentAttempts, fetchAllAttemptsWithStudent } from '@/lib/database';
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
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [tab, setTab] = useState<Tab>('students');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Header user={user} fullName={user?.full_name} subtitle="لوحة المعلم" onLogout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <TabNav tabs={TABS} active={tab} onChange={setTab} darkMode={darkMode} />

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
  const { darkMode } = useAuth();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [studentGrades, setStudentGrades] = useState<Record<string, any>>({});

  const GRADE_OPTIONS = [
    { value: 'all', label: 'جميع الصفوف' },
    { value: 'الصف الأول الثانوي', label: 'الصف الأول الثانوي' },
    { value: 'الصف الثاني الثانوي', label: 'الصف الثاني الثانوي' },
    { value: 'الصف الثالث الثانوي', label: 'الصف الثالث الثانوي' },
  ];

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAllStudents(),
      fetchAllAttemptsWithStudent()
    ])
      .then(([studentsData, attemptsData]) => { 
        if (active) { 
          setStudents(studentsData); 
          setError('');
          
          // Process grades for each student
          const gradesMap: Record<string, any> = {};
          attemptsData.forEach(attempt => {
            const studentId = attempt.student_id;
            if (!gradesMap[studentId]) {
              gradesMap[studentId] = {
                totalAttempts: 0,
                totalScore: 0,
                totalQuestions: 0,
                attempts: []
              };
            }
            gradesMap[studentId].totalAttempts++;
            gradesMap[studentId].totalScore += attempt.score;
            gradesMap[studentId].totalQuestions += attempt.total;
            gradesMap[studentId].attempts.push(attempt);
          });
          setStudentGrades(gradesMap);
        } 
      })
      .catch(() => { if (active) setError('تعذر تحميل قائمة الطلاب'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch = s.full_name.includes(search) || s.student_phone.includes(search);
    const matchesGrade = gradeFilter === 'all' || s.grade_level === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <Users className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          الطلاب المسجلون
          <span className={`text-sm font-normal ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>({students.length})</span>
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="ابحث بالاسم أو رقم الهاتف..." 
          className={`input-field max-w-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : ''}`} 
        />
        <select 
          value={gradeFilter} 
          onChange={(e) => setGradeFilter(e.target.value)}
          className={`input-field max-w-xs ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`}
        >
          {GRADE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={`flex flex-col items-center py-20 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm">جاري تحميل الطلاب...</p>
        </div>
      ) : error ? (
        <div className={`flex flex-col items-center py-20 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
          <ShieldAlert className="w-8 h-8 mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`flex flex-col items-center py-20 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
          <Users className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">{students.length === 0 ? 'لا يوجد طلاب مسجلون بعد' : 'لا توجد نتائج مطابقة'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <StudentCard key={student.id} student={student} grades={studentGrades[student.id]} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCard({ student, grades, darkMode }: { student: Profile; grades?: any; darkMode: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  
  // Calculate progress percentage
  const progressPercentage = grades ? Math.round((grades.totalScore / grades.totalQuestions) * 100) : 0;
  const circumference = 2 * Math.PI * 18; // r=18
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className={`card p-5 hover:shadow-md transition-shadow ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
      <div className="flex items-start gap-3 mb-4">
        <Avatar user={student} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{student.full_name}</h3>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            {student.grade_level ?? 'غير محدد'}
          </span>
        </div>
      </div>
      
      {/* Progress Circle */}
      {grades && grades.totalAttempts > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke={darkMode ? '#374151' : '#e2e8f0'}
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke={progressPercentage >= 70 ? '#10b981' : progressPercentage >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{progressPercentage}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Award className={`w-3 h-3 ${progressPercentage >= 70 ? 'text-green-500' : progressPercentage >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
              <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                {grades.totalAttempts} امتحان
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-3 h-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                المجموع: {grades.totalScore}/{grades.totalQuestions}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5 text-sm">
        <InfoRow icon={<Phone className="w-4 h-4" />} label="هاتف الطالب" value={student.student_phone} darkMode={darkMode} />
        <InfoRow icon={<Phone className="w-4 h-4" />} label="هاتف ولي الأمر" value={student.guardian_phone || '—'} darkMode={darkMode} />
        <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          <Lock className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>كلمة المرور:</span>
          <span className="font-mono text-xs">{showPassword ? student.password : '••••••••'}</span>
          <button onClick={() => setShowPassword((v) => !v)} className={`text-xs mr-auto ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}>
            {showPassword ? 'إخفاء' : 'إظهار'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, darkMode }: { icon: React.ReactNode; label: string; value: string; darkMode: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
      <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{icon}</span>
      <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}:</span>
      <span className={`font-medium text-xs ${darkMode ? 'text-white' : ''}`}>{value}</span>
    </div>
  );
}

// ---- Shared layout components ----

export function Header({ user, fullName, subtitle, onLogout, darkMode, toggleDarkMode }: { user: Profile | null; fullName?: string; subtitle: string; onLogout: () => void; darkMode: boolean; toggleDarkMode: () => void }) {
  return (
    <header className={`sticky top-0 z-20 border-b transition-colors duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${darkMode ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/20' : 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-600/20'}`}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>ذكاء بالعربي</h1>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="text-left hidden sm:block">
            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{fullName}</p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{subtitle}</p>
          </div>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={fullName} className={`w-9 h-9 rounded-full object-cover border-2 ${darkMode ? 'border-slate-600' : 'border-blue-100'}`} />
          ) : (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-blue-100'}`}>
              <UserRound className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          )}
          <button onClick={onLogout} className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}`}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function TabNav<T extends string>({ tabs, active, onChange, darkMode }: { tabs: { id: T; label: string; icon: React.ReactNode }[]; active: T; onChange: (id: T) => void; darkMode: boolean }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            active === t.id
              ? darkMode ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : darkMode ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
