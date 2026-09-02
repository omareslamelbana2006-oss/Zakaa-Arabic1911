import { useState } from 'react';
import { BookOpen, ClipboardList, Trophy, MessageCircle, UserRound, Phone, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Header, TabNav } from './TeacherDashboard';
import MotivationalQuote from '@/components/MotivationalQuote';
import LessonsScreen from './LessonsScreen';
import ExamsScreen from './ExamsScreen';
import HonorBoardScreen from './HonorBoardScreen';
import ChatScreen from './ChatScreen';

type Tab = 'home' | 'lessons' | 'exams' | 'honor' | 'chat';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'الرئيسية', icon: <UserRound className="w-4 h-4" /> },
  { id: 'lessons', label: 'الدروس', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'exams', label: 'الامتحانات', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'honor', label: 'لوحة الشرف', icon: <Trophy className="w-4 h-4" /> },
  { id: 'chat', label: 'الشات', icon: <MessageCircle className="w-4 h-4" /> },
];

export default function StudentDashboard() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Header user={user} fullName={user?.full_name} subtitle="لوحة الطالب" onLogout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <TabNav tabs={TABS} active={tab} onChange={setTab} darkMode={darkMode} />

        <div className="mt-6">
          {tab === 'home' && <HomeTab />}
          {tab === 'lessons' && <LessonsScreen isTeacher={false} />}
          {tab === 'exams' && <ExamsScreen isTeacher={false} />}
          {tab === 'honor' && <HonorBoardScreen />}
          {tab === 'chat' && <ChatScreen />}
        </div>
      </div>
    </div>
  );
}

function HomeTab() {
  const { user, darkMode } = useAuth();
  return (
    <div>
      {/* Welcome card */}
      <div className={`rounded-2xl shadow-xl overflow-hidden mb-6 ${darkMode ? 'bg-slate-800 border border-slate-700 shadow-slate-900/50' : 'bg-white border border-slate-100 shadow-blue-200/60'}`}>
        <div className={`px-6 py-8 text-center ${darkMode ? 'bg-gradient-to-l from-blue-700 to-blue-900' : 'bg-gradient-to-l from-blue-600 to-blue-800'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-3 overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <UserRound className="w-9 h-9 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">أهلاً بك، {user?.full_name}</h2>
          <p className="text-blue-100 text-sm">نورت منصة ذكاء بالعربي</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard icon={<BookOpen className="w-5 h-5" />} label="الصف الدراسي" value={user?.grade_level ?? 'غير محدد'} darkMode={darkMode} />
            <InfoCard icon={<Phone className="w-5 h-5" />} label="رقم الهاتف" value={user?.student_phone ?? ''} darkMode={darkMode} />
          </div>
        </div>
      </div>

      {/* Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InteractiveCard 
          icon={<ClipboardList className="w-8 h-8" />}
          title="قسم الامتحانات"
          description="اختبر معلوماتك وحل الامتحانات"
          gradient="from-purple-500 to-indigo-600"
          onClick={() => setTab('exams')}
          darkMode={darkMode}
        />
        <InteractiveCard 
          icon={<BookOpen className="w-8 h-8" />}
          title="قسم الدروس"
          description="استفد من الشروحات والدروس"
          gradient="from-blue-500 to-cyan-600"
          onClick={() => setTab('lessons')}
          darkMode={darkMode}
        />
        <InteractiveCard 
          icon={<MessageCircle className="w-8 h-8" />}
          title="الشات مع المعلم"
          description="تواصل مباشرة مع المعلم"
          gradient="from-emerald-500 to-teal-600"
          onClick={() => setTab('chat')}
          darkMode={darkMode}
        />
      </div>

      <MotivationalQuote />
    </div>
  );
}

function InfoCard({ icon, label, value, darkMode }: { icon: React.ReactNode; label: string; value: string; darkMode: boolean }) {
  return (
    <div className={`rounded-xl p-4 flex items-center gap-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-xs mb-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
        <p className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  );
}

function InteractiveCard({ icon, title, description, gradient, onClick, darkMode }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  gradient: string; 
  onClick: () => void; 
  darkMode: boolean 
}) {
  return (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 text-right transition-all duration-300 hover:scale-105 hover:shadow-xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 transition-opacity duration-300 hover:opacity-20`} />
      <div className="relative">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
        <div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          <span>اذهب إلى القسم</span>
          <ArrowLeft className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
