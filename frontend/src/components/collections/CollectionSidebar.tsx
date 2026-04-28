'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { useCollections } from '@/hooks/useCollections';

export function CollectionSidebar() {
  const { collections, isLoading, createCollection, deleteCollection } = useCollections();
  const pathname = usePathname();
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createCollection({ name: newName.trim() });
    setNewName('');
    setIsAdding(false);
  };

  return (
    <aside className="flex flex-col gap-1 w-56 shrink-0">
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Collections</span>
        <button onClick={() => setIsAdding((v) => !v)} className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="New collection">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="flex gap-1 px-2 mb-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name"
            className="flex-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" size="sm" className="h-7 px-2 text-xs">Add</Button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-1 px-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-7 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : (
        <nav className="flex flex-col gap-0.5">
          <Link
            href="/snippets"
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              pathname === '/snippets'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            All snippets
          </Link>

          {collections.map((col) => (
            <div key={col.id} className="group flex items-center">
              <Link
                href={`/collections/${col.id}`}
                className={cn(
                  'flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                  pathname === `/collections/${col.id}`
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
                <span className="truncate">{col.name}</span>
              </Link>
              <button
                onClick={() => deleteCollection(col.id)}
                className="mr-1 p-1 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Delete collection"
              >
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </nav>
      )}
    </aside>
  );
}
