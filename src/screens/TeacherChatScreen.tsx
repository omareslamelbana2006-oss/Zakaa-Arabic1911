import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Loader2, ArrowRight, Users } from 'lucide-react';
import { fetchAllChats, teacherReply } from '@/lib/database';
import type { Profile, ChatMessage } from '@/lib/supabase';

interface ChatThread {
  student_id: string;
  profiles: Profile;
  messages: ChatMessage[];
}

export default function TeacherChatScreen() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = () => {
    fetchAllChats()
      .then((data) => { setThreads(data); setError(''); })
      .catch(() => setError('تعذر تحميل المحادثات'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [threads, activeStudent]);

  const activeThread = threads.find((t) => t.student_id === activeStudent);

  const handleReply = async () => {
    if (!text.trim() || !activeStudent) return;
    setSending(true);
    const msg = text.trim();
    setText('');
    try {
      await teacherReply(activeStudent, msg);
      load();
    } catch {
      setError('تعذر إرسال الرد');
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>;

  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  if (threads.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          الرسائل
        </h2>
        <div className="flex flex-col items-center py-12 text-slate-400">
          <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">لا توجد رسائل من الطلاب</p>
        </div>
      </div>
    );
  }

  // Mobile: show thread list or active conversation
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        الرسائل
      </h2>

      <div className="card flex" style={{ height: '60vh' }}>
        {/* Thread list */}
        <div className={`w-full sm:w-64 border-l border-slate-100 overflow-y-auto ${activeStudent ? 'hidden sm:block' : ''}`}>
          {threads.map((t) => (
            <button
              key={t.student_id}
              onClick={() => setActiveStudent(t.student_id)}
              className={`w-full text-right p-3 border-b border-slate-50 flex items-center gap-2 transition-colors ${activeStudent === t.student_id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 text-xs font-bold">
                {t.profiles.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{t.profiles.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{t.messages[t.messages.length - 1]?.message}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className={`flex-1 flex flex-col ${!activeStudent ? 'hidden sm:flex' : ''}`}>
          {activeThread ? (
            <>
              <div className="flex items-center gap-2 p-3 border-b border-slate-100">
                <button onClick={() => setActiveStudent(null)} className="sm:hidden text-slate-400 hover:text-slate-600">
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="font-semibold text-slate-700 text-sm">{activeThread.profiles.full_name}</p>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeThread.messages.map((msg) => {
                  const isTeacher = msg.sender === 'teacher';
                  return (
                    <div key={msg.id} className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${isTeacher ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-700 rounded-bl-sm'}`}>
                        <p>{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${isTeacher ? 'text-blue-100' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-100 p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !sending && handleReply()}
                  placeholder="اكتب ردك..."
                  className="input-field !py-2"
                  disabled={sending}
                />
                <button onClick={handleReply} disabled={sending || !text.trim()} className="btn-primary !w-auto !px-4 !py-2.5 shrink-0">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Users className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">اختر محادثة للرد على طالب</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
