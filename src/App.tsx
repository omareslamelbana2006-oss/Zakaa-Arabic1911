import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthScreen from '@/screens/AuthScreen';
import TeacherDashboard from '@/screens/TeacherDashboard';
import StudentDashboard from '@/screens/StudentDashboard';

function AppContent() {
  const { user } = useAuth();

  if (!user) return <AuthScreen />;
  if (user.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
