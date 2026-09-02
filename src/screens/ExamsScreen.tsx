import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Trash2, Loader2, ChevronLeft, CheckCircle2, XCircle, Award, ArrowRight, Lock } from 'lucide-react';
import { Modal } from './LessonsScreen';
import { Certificate } from '@/components/Certificate';
import { useAuth } from '@/context/AuthContext';
import {
  fetchExams, createExam, deleteExam, fetchQuestions, addQuestion, deleteQuestion,
  fetchAttempt, submitAttempt, type QuestionInput,
} from '@/lib/database';
import type { Exam, Question, Attempt } from '@/lib/supabase';

export default function ExamsScreen({ isTeacher }: { isTeacher: boolean }) {
  const { user, darkMode } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  const load = () => {
    setLoading(true);
    fetchExams()
      .then((data) => { setExams(data); setError(''); })
      .catch(() => setError('تعذر تحميل الامتحانات'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!examTitle.trim()) { setError('يرجى إدخال عنوان الامتحان'); return; }
    setSubmitting(true);
    try {
      await createExam(examTitle.trim(), examDesc.trim());
      setExamTitle(''); setExamDesc('');
      setShowCreate(false);
      load();
    } catch {
      setError('تعذر إنشاء الامتحان');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteExam(id); load(); } catch { setError('تعذر حذف الامتحان'); }
  };

  if (activeExam) {
    return isTeacher
      ? <ManageExam exam={activeExam} onBack={() => { setActiveExam(null); load(); }} />
      : <TakeExam exam={activeExam} studentId={user!.id} onBack={() => setActiveExam(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <ClipboardList className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          الامتحانات
        </h2>
        {isTeacher && (
          <button onClick={() => setShowCreate(true)} className="btn-secondary !py-2">
            <Plus className="w-4 h-4" />
            إنشاء امتحان
          </button>
        )}
      </div>

      {error && <p className={`text-sm mb-3 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className={`w-7 h-7 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} /></div>
      ) : exams.length === 0 ? (
        <div className={`flex flex-col items-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
          <ClipboardList className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">لا توجد امتحانات بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} isTeacher={isTeacher} studentId={user?.id} onOpen={() => setActiveExam(exam)} onDelete={() => handleDelete(exam.id)} darkMode={darkMode} />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="إنشاء امتحان جديد" darkMode={darkMode}>
          <div className="space-y-3">
            <div>
              <label className={`text-sm font-medium mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>عنوان الامتحان</label>
              <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className={`input-field ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : ''}`} placeholder="عنوان الامتحان" />
            </div>
            <div>
              <label className={`text-sm font-medium mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>الوصف (اختياري)</label>
              <textarea value={examDesc} onChange={(e) => setExamDesc(e.target.value)} className={`input-field min-h-[80px] resize-y ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : ''}`} placeholder="وصف الامتحان" />
            </div>
            <button onClick={handleCreate} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---- Exam Card ----

function ExamCard({ exam, isTeacher, studentId, onOpen, onDelete, darkMode }: { exam: Exam; isTeacher: boolean; studentId?: string; onOpen: () => void; onDelete: () => void; darkMode: boolean }) {
  const [attempt, setAttempt] = useState<Attempt | null | undefined>(undefined);

  useEffect(() => {
    if (!isTeacher && studentId) {
      fetchAttempt(exam.id, studentId).then(setAttempt).catch(() => setAttempt(null));
    }
  }, [exam.id, studentId, isTeacher]);

  return (
    <div className={`card p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{exam.title}</h3>
        {isTeacher && (
          <button onClick={onDelete} className={`p-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-600'}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {exam.description && <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{exam.description}</p>}
      {!isTeacher && attempt !== undefined && (
        attempt ? (
          <div className="flex items-center gap-2 text-sm mb-3">
            <span className={`px-2.5 py-1 rounded-full font-semibold ${attempt.percentage >= 90 ? (darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-600') : attempt.percentage >= 50 ? (darkMode ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-50 text-amber-600') : (darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-600')}`}>
              {attempt.percentage}%
            </span>
            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>تم أداء الامتحان</span>
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 text-sm mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs">لم تؤدِ هذا الامتحان بعد</span>
          </div>
        )
      )}
      <button onClick={onOpen} className="btn-secondary !w-auto !py-2 text-xs">
        {isTeacher ? 'إدارة الأسئلة' : attempt ? 'مراجعة الإجابات' : 'بدء الامتحان'}
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---- Take Exam (Student) ----

function TakeExam({ exam, studentId, onBack }: { exam: Exam; studentId: string; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [existingAttempt, setExistingAttempt] = useState<Attempt | null>(null);
  const [result, setResult] = useState<Attempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchQuestions(exam.id), fetchAttempt(exam.id, studentId)])
      .then(([qs, att]) => {
        setQuestions(qs);
        setExistingAttempt(att);
        if (att) setAnswers(att.answers);
      })
      .catch(() => setError('تعذر تحميل الامتحان'))
      .finally(() => setLoading(false));
  }, [exam.id, studentId]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('يرجى الإجابة على جميع الأسئلة');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const att = await submitAttempt(exam.id, studentId, answers, questions);
      setResult(att);
    } catch (err) {
      setError(err instanceof Error && err.message.includes('duplicate') ? 'لقد أديت هذا الامتحان بالفعل' : 'تعذر تسجيل الإجابات');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>;

  if (result || (existingAttempt && !submitting)) {
    const att = result || existingAttempt!;
    const passed = att.percentage >= 90;
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowRight className="w-4 h-4" />
          العودة للامتحانات
        </button>
        <div className="card p-6 mb-4 text-center">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${passed ? 'bg-green-50' : att.percentage >= 50 ? 'bg-amber-50' : 'bg-red-50'}`}>
            {passed ? <Award className="w-8 h-8 text-green-600" /> : att.percentage >= 50 ? <CheckCircle2 className="w-8 h-8 text-amber-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">نتيجة الامتحان</h3>
          <p className="text-3xl font-bold text-blue-700 mb-1">{att.percentage}%</p>
          <p className="text-sm text-slate-500">{att.score} من {att.total} إجابة صحيحة</p>
          {passed && <p className="text-sm text-green-600 font-semibold mt-2">مبروك! لقد حصلت على شهادة تقدير</p>}
        </div>

        {passed && (
          <div className="mb-4">
            <Certificate student={{ ...({} as any), full_name: '', ...({} as any) } as any} attempt={att} examTitle={exam.title} />
          </div>
        )}

        {/* Answer review */}
        <div className="mt-4">
          <h4 className="font-bold text-slate-800 mb-3">مراجعة الإجابات</h4>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const studentAns = att.answers[q.id];
              const correct = studentAns === q.correct_answer;
              return (
                <div key={q.id} className="card p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {correct ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                    <p className="text-sm font-semibold text-slate-700">{i + 1}. {q.question_text}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['a','b','c','d'] as const).map((opt) => {
                      const val = q[`option_${opt}`];
                      const isCorrect = q.correct_answer === opt;
                      const isStudent = studentAns === opt;
                      return (
                        <div key={opt} className={`px-2.5 py-1.5 rounded-lg border ${isCorrect ? 'border-green-300 bg-green-50 text-green-700' : isStudent ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                          {val}
                          {isCorrect && ' ✓'}
                          {isStudent && !isCorrect && ' ✗'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowRight className="w-4 h-4" />
        العودة للامتحانات
      </button>
      <h2 className="text-lg font-bold text-slate-800 mb-1">{exam.title}</h2>
      {exam.description && <p className="text-sm text-slate-500 mb-4">{exam.description}</p>}
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {existingAttempt && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          لقد أديت هذا الامتحان بالفعل. لا يمكن إعادته. يمكنك مراجعة إجاباتك أدناه.
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, i) => {
          const studentAns = existingAttempt ? existingAttempt.answers[q.id] : answers[q.id];
          return (
            <div key={q.id} className="card p-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">{i + 1}. {q.question_text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['a','b','c','d'] as const).map((opt) => {
                  const val = q[`option_${opt}`];
                  const selected = studentAns === opt;
                  return (
                    <button
                      key={opt}
                      disabled={!!existingAttempt}
                      onClick={() => { if (!existingAttempt) setAnswers((p) => ({ ...p, [q.id]: opt })); }}
                      className={`text-right px-3 py-2 rounded-lg border text-sm transition-all ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300'} ${existingAttempt ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!existingAttempt && questions.length > 0 && (
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary mt-4">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تسليم الإجابات'}
        </button>
      )}
    </div>
  );
}

// ---- Manage Exam (Teacher) ----

function ManageExam({ exam, onBack }: { exam: Exam; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<QuestionInput>({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a',
  });

  const load = () => {
    fetchQuestions(exam.id)
      .then(setQuestions)
      .catch(() => setError('تعذر تحميل الأسئلة'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [exam.id]);

  const handleAdd = async () => {
    if (!form.question_text.trim() || !form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim() || !form.option_d.trim()) {
      setError('يرجى تعبئة جميع الحقول'); return;
    }
    setSubmitting(true); setError('');
    try {
      await addQuestion(exam.id, form);
      setForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' });
      setShowForm(false); load();
    } catch {
      setError('تعذر إضافة السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteQuestion(id); load(); } catch { setError('تعذر حذف السؤال'); }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowRight className="w-4 h-4" />
        العودة للامتحانات
      </button>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{exam.title}</h2>
          <p className="text-sm text-slate-400">{questions.length} سؤال</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-secondary !py-2">
          <Plus className="w-4 h-4" />
          إضافة سؤال
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-slate-400">
          <ClipboardList className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">لا توجد أسئلة بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">{i + 1}. {q.question_text}</p>
                <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['a','b','c','d'] as const).map((opt) => (
                  <div key={opt} className={`px-2.5 py-1.5 rounded-lg border ${q.correct_answer === opt ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    {q[`option_${opt}`]}{q.correct_answer === opt && ' ✓'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="إضافة سؤال جديد">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">نص السؤال</label>
              <textarea value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} className="input-field min-h-[70px] resize-y" placeholder="نص السؤال" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['a','b','c','d'] as const).map((opt) => (
                <div key={opt}>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">الخيار {opt.toUpperCase()}</label>
                  <input type="text" value={form[`option_${opt}`]} onChange={(e) => setForm({ ...form, [`option_${opt}`]: e.target.value })} className="input-field" placeholder={`الخيار ${opt.toUpperCase()}`} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">الإجابة الصحيحة</label>
              <select value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value as 'a'|'b'|'c'|'d' })} className="input-field">
                <option value="a">الخيار A</option>
                <option value="b">الخيار B</option>
                <option value="c">الخيار C</option>
                <option value="d">الخيار D</option>
              </select>
            </div>
            <button onClick={handleAdd} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إضافة'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
