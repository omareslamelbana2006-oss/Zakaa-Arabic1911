import { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Play, FileText, X } from 'lucide-react';
import { fetchLessons, createLesson, deleteLesson } from '@/lib/database';
import { useAuth } from '@/context/AuthContext';
import type { Lesson } from '@/lib/supabase';

export default function LessonsScreen({ isTeacher }: { isTeacher: boolean }) {
  const { darkMode } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchLessons()
      .then((data) => { setLessons(data); setError(''); })
      .catch(() => setError('تعذر تحميل الدروس'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) { setError('يرجى إدخال عنوان الدرس'); return; }
    setSubmitting(true);
    try {
      await createLesson(title.trim(), content.trim(), videoUrl.trim());
      setTitle(''); setContent(''); setVideoUrl('');
      setShowForm(false);
      load();
    } catch {
      setError('تعذر إضافة الدرس');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLesson(id);
      load();
    } catch {
      setError('تعذر حذف الدرس');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <BookOpen className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          الدروس
        </h2>
        {isTeacher && (
          <button onClick={() => setShowForm(true)} className="btn-secondary !py-2">
            <Plus className="w-4 h-4" />
            إضافة درس
          </button>
        )}
      </div>

      {error && <p className={`text-sm mb-3 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className={`w-7 h-7 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} /></div>
      ) : lessons.length === 0 ? (
        <div className={`flex flex-col items-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
          <BookOpen className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">لا توجد دروس بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className={`card p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{lesson.title}</h3>
                </div>
                {isTeacher && (
                  <button onClick={() => handleDelete(lesson.id)} className={`p-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-600'}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {lesson.content && <p className={`text-sm leading-relaxed mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{lesson.content}</p>}
              {lesson.video_url && (
                <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  <Play className="w-4 h-4" />
                  مشاهدة الفيديو
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add lesson modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="إضافة درس جديد" darkMode={darkMode}>
          <div className="space-y-3">
            <div>
              <label className={`text-sm font-medium mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>عنوان الدرس</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : ''}`} placeholder="عنوان الدرس" />
            </div>
            <div>
              <label className={`text-sm font-medium mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>المحتوى</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`input-field min-h-[100px] resize-y ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : ''}`} placeholder="محتوى الدرس" />
            </div>
            <div>
              <label className={`text-sm font-medium mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>رابط الفيديو (اختياري)</label>
              <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : ''}`} placeholder="https://..." />
            </div>
            <button onClick={handleCreate} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إضافة'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Modal({ children, onClose, title, darkMode }: { children: React.ReactNode; onClose: () => void; title: string; darkMode: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className={`rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
          <button onClick={onClose} className={`p-1 ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
