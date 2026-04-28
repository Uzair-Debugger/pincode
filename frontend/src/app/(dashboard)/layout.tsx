'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { CollectionSidebar } from '@/components/collections/CollectionSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <div className="flex flex-1 gap-0">
        <div className="hidden md:flex flex-col gap-2 p-4 border-r border-gray-200 dark:border-gray-800">
          <CollectionSidebar />
        </div>
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
