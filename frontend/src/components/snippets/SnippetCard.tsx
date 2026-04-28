'use client';

import Link from 'next/link';
import { cn } from '@/utils/cn';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import type { Snippet } from '@/types/domain';

interface SnippetCardProps {
  snippet: Snippet;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

export function SnippetCard({ snippet, onToggleFavorite, onDelete }: SnippetCardProps) {
  return (
    <article className={cn(
      'group flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-700',
      'bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow'
    )}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/snippets/${snippet.id}`} className="flex-1 min-w-0">
          <h3 className="truncate font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {snippet.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleFavorite(snippet.id, snippet.isFavorite)}
            aria-label={snippet.isFavorite ? 'Unfavorite' : 'Favorite'}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className={cn('text-base', snippet.isFavorite ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600')}>★</span>
          </button>
          <button
            onClick={() => onDelete(snippet.id)}
            aria-label="Delete snippet"
            className="p-1 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {snippet.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{snippet.description}</p>
      )}

      <pre className="rounded-md bg-gray-50 dark:bg-gray-800 p-2 text-xs overflow-hidden max-h-20 text-gray-700 dark:text-gray-300 font-mono">
        <code>{snippet.code.slice(0, 200)}{snippet.code.length > 200 ? '…' : ''}</code>
      </pre>

      <div className="flex items-center gap-2 flex-wrap">
        <LanguageBadge language={snippet.language} />
        {snippet.snippetTags.map(({ tag }) => (
          <span key={tag.id} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {tag.name}
          </span>
        ))}
      </div>
    </article>
  );
}
