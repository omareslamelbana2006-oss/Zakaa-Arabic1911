import { UserRound } from 'lucide-react';
import type { Profile } from '@/lib/supabase';

export function Avatar({ user, size = 'md' }: { user: Profile | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-blue-100`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-100 flex items-center justify-center shrink-0`}>
      <UserRound className={`${iconSizes[size]} text-blue-500`} />
    </div>
  );
}
