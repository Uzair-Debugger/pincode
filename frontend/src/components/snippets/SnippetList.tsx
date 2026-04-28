'use client';

import { SnippetCard } from './SnippetCard';
import type { Snippet } from '@/types/domain';

interface SnippetListProps {
  snippets: Snippet[];
  isLoading: boolean;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

function Skeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-16 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

export function SnippetList({ snippets, isLoading, onToggleFavorite, onDelete }: SnippetListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }
  // ?. safely accesses .length only if snippets exists
  // prevents crash when snippets is null/undefined

  if (!snippets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600 gap-2">
        <svg className="size-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No snippets found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
