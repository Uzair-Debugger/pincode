'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';

export function AppHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <Link href="/snippets" className="font-bold text-lg tracking-tight">
        Pin<span className="text-blue-600">Code</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}
