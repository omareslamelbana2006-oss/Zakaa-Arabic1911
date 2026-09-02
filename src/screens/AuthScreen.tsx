import { useEffect, useRef, useState } from 'react';
import { GraduationCap, User, UserPlus, LogIn, Phone, Lock, BookOpen, Loader2, AlertCircle, ShieldCheck, Camera, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signUpStudent, signUpTeacher, signIn, teacherExists, uploadAvatar } from '@/lib/auth';
import type { Role } from '@/lib/supabase';

const GRADES = [
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
];

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const { login, darkMode, toggleDarkMode } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('student');
  const [teacherLocked, setTeacherLocked] = useState(false);

  // Shared
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student-only
  const [guardianPhone, setGuardianPhone] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    teacherExists().then((exists) => { if (active) setTeacherLocked(exists); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const resetFields = () => {
    setError('');
    setFullName('');
    setPhone('');
    setPassword('');
    setGuardianPhone('');
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRegister = async () => {
    setError('');
    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    if (role === 'student' && !guardianPhone.trim()) {
      setError('يرجى إدخال رقم هاتف ولي الأمر');
      return;
    }
    if (role === 'teacher' && teacherLocked) {
      setError('تم تسجيل حساب المعلم بالفعل، لا يمكن إنشاء أكثر من حساب معلم');
      return;
    }
    setLoading(true);
    try {
      if (role === 'student') {
        let avatarUrl: string | null = null;
        if (avatarFile) {
          avatarUrl = await uploadAvatar(avatarFile);
        }
        const user = await signUpStudent({
          full_name: fullName.trim(),
          student_phone: phone.trim(),
          guardian_phone: guardianPhone.trim(),
          password,
          grade_level: grade,
          avatar_url: avatarUrl,
        });
        login(user);
      } else {
        const user = await signUpTeacher({
          full_name: fullName.trim(),
          student_phone: phone.trim(),
          password,
        });
        login(user);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء التسجيل';
      setError(msg.includes('duplicate') ? 'رقم الهاتف مسجل بالفعل' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!phone.trim() || !password.trim()) {
      setError('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(phone.trim(), password);
      login(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900'}`}>
      <div className="w-full max-w-md">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-300 ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 ${darkMode ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30' : 'bg-gradient-to-br from-white to-blue-100 shadow-white/30'}`}>
            <GraduationCap className={`w-9 h-9 ${darkMode ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <h1 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-white'}`}>ذكاء بالعربي</h1>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-blue-100'}`}>منصة تعليمية بسيطة وسريعة</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
          {/* Tabs */}
          <div className={`flex border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? darkMode ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50' : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? darkMode ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50' : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              حساب جديد
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className={`mb-4 flex items-start gap-2 text-sm rounded-lg px-3 py-2.5 border ${darkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              <div className="space-y-4">
                <Field icon={<Phone className="w-4 h-4" />} label="رقم الهاتف" darkMode={darkMode}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : ''}`} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                </Field>
                <Field icon={<Lock className="w-4 h-4" />} label="كلمة المرور" darkMode={darkMode}>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : ''}`} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                </Field>
                <button onClick={handleLogin} disabled={loading} className={`btn-primary ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Role selector */}
                <div className="grid grid-cols-2 gap-3">
                  <RoleButton active={role === 'student'} onClick={() => { setRole('student'); resetFields(); }} icon={<User className="w-5 h-5" />} label="طالب" darkMode={darkMode} />
                  <RoleButton active={role === 'teacher'} onClick={() => { setRole('teacher'); resetFields(); }} icon={<ShieldCheck className="w-5 h-5" />} label="معلم" disabled={teacherLocked} locked={teacherLocked} darkMode={darkMode} />
                </div>

                {/* Avatar upload (student only) */}
                {role === 'student' && (
                  <div className="flex flex-col items-center">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    {avatarPreview ? (
                      <div className="relative">
                        <img src={avatarPreview} alt="معاينة" className={`w-20 h-20 rounded-full object-cover border-2 ${darkMode ? 'border-slate-600' : 'border-blue-200'}`} />
                        <button onClick={removeAvatar} className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()} className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600' : 'bg-blue-50 border-blue-300 text-blue-400 hover:bg-blue-100'}`}>
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">الصورة الشخصية</span>
                      </button>
                    )}
                  </div>
                )}

                <Field icon={<User className="w-4 h-4" />} label="الاسم" darkMode={darkMode}>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={role === 'student' ? 'الاسم الثلاثي' : 'الاسم'} className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : ''}`} />
                </Field>
                <Field icon={<Phone className="w-4 h-4" />} label="رقم الهاتف" darkMode={darkMode}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : ''}`} />
                </Field>
                {role === 'student' && (
                  <>
                    <Field icon={<Phone className="w-4 h-4" />} label="رقم هاتف ولي الأمر" darkMode={darkMode}>
                      <input type="tel" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="05xxxxxxxx" className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : ''}`} />
                    </Field>
                    <Field icon={<BookOpen className="w-4 h-4" />} label="الصف الدراسي" darkMode={darkMode}>
                      <select value={grade} onChange={(e) => setGrade(e.target.value)} className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500' : ''}`}>
                        {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
                      </select>
                    </Field>
                  </>
                )}
                <Field icon={<Lock className="w-4 h-4" />} label="كلمة المرور" darkMode={darkMode}>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : ''}`} />
                </Field>
                <button onClick={handleRegister} disabled={loading || (role === 'teacher' && teacherLocked)} className={`btn-primary ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء حساب'}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className={`text-center text-xs mt-6 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>منصة ذكاء بالعربي التعليمية</p>
      </div>
    </div>
  );
}

function Field({ icon, label, children, darkMode }: { icon: React.ReactNode; label: string; children: React.ReactNode; darkMode: boolean }) {
  return (
    <div>
      <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        <span className={darkMode ? 'text-blue-400' : 'text-blue-500'}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function RoleButton({ active, onClick, icon, label, disabled, locked, darkMode }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean; locked?: boolean; darkMode: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${active ? (darkMode ? 'border-blue-500 bg-slate-700 text-blue-400' : 'border-blue-600 bg-blue-50 text-blue-700') : (darkMode ? 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300')} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
      {icon}
      <span className="text-sm font-semibold">{label}</span>
      {locked && (<span className={`absolute -top-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${darkMode ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>محجوز</span>)}
    </button>
  );
}
