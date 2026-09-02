import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchChatMessages, sendChatMessage } from '@/lib/database';
import type { ChatMessage } from '@/lib/supabase';

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = () => {
    if (!user) return;
    fetchChatMessages(user.id)
      .then((data) => { setMessages(data); setError(''); })
      .catch(() => setError('تعذر تحميل الرسائل'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    setError('');
    const msg = text.trim();
    setText('');
    try {
      await sendChatMessage(user.id, msg);
      load();
    } catch {
      setError('تعذر إرسال الرسالة');
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        الشات المباشر
      </h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="card flex flex-col" style={{ height: '60vh' }}>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">لا توجد رسائل بعد</p>
              <p className="text-xs mt-1">ابدأ المحادثة بإرسال رسالة</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isStudent = msg.sender === 'student';
              return (
                <div key={msg.id} className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${isStudent ? 'bg-blue-600 text-white rounded-bl-sm' : 'bg-slate-100 text-slate-700 rounded-br-sm'}`}>
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isStudent ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 p-3 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !sending && handleSend()}
            placeholder="اكتب رسالتك..."
            className="input-field !py-2"
            disabled={sending}
          />
          <button onClick={handleSend} disabled={sending || !text.trim()} className="btn-primary !w-auto !px-4 !py-2.5 shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
