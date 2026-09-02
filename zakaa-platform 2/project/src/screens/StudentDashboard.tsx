import { useState } from 'react';
import { BookOpen, ClipboardList, Trophy, MessageCircle, UserRound, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Header, TabNav } from './TeacherDashboard';
import { Avatar } from '@/components/Avatar';
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
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} fullName={user?.full_name} subtitle="لوحة الطالب" onLogout={logout} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

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
  const { user } = useAuth();
  return (
    <div>
      {/* Welcome card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-blue-200/60 border border-slate-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-l from-blue-600 to-blue-800 px-6 py-8 text-center">
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
            <InfoCard icon={<BookOpen className="w-5 h-5" />} label="الصف الدراسي" value={user?.grade_level ?? 'غير محدد'} />
            <InfoCard icon={<Phone className="w-5 h-5" />} label="رقم الهاتف" value={user?.student_phone ?? ''} />
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
        <p className="text-blue-700 text-sm leading-relaxed">
          العلم نور والجهل ظلام، واصل طريقك في التعلم فالنجاح حليف من يجتهد.
          بالتوفيق في رحلتك التعليمية!
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="font-bold text-slate-800 text-sm truncate">{value}</p>
      </div>
    </div>
  );
}
