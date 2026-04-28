'use client';

import { useState, useCallback } from 'react';
import { useSnippets } from '@/hooks/useSnippets';
import { SnippetList } from '@/components/snippets/SnippetList';
import { SnippetEditor } from '@/components/snippets/SnippetEditor';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import type { CreateSnippetInput } from '@/types/domain';

const LANGUAGES = ['', 'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'bash', 'sql'];

export default function SnippetsPage() {
  const { snippets, isLoading, error, filters, setFilters, createSnippet, updateSnippet, deleteSnippet, total, page, totalPages } = useSnippets();
  const [showEditor, setShowEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSearch = useCallback((q: string) => setFilters({ search: q || undefined }), [setFilters]);

  const handleCreate = async (input: CreateSnippetInput) => {
    setIsSaving(true);
    try {
      await createSnippet(input);
      setShowEditor(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = (id: string, current: boolean) =>
    updateSnippet(id, { isFavorite: !current });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar onSearch={handleSearch} className="flex-1 min-w-48" />
        <select
          value={filters.language ?? ''}
          onChange={(e) => setFilters({ language: e.target.value || undefined })}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All languages</option>
          {LANGUAGES.filter(Boolean).map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button
          onClick={() => setFilters({ isFavorite: filters.isFavorite ? undefined : true })}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${filters.isFavorite ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          ★ Favorites
        </button>
        <Button size="sm" onClick={() => setShowEditor(true)}>+ New snippet</Button>
      </div>

      {/* New snippet editor */}
      {showEditor && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-semibold mb-4">New snippet</h2>
          <SnippetEditor onSave={handleCreate} onCancel={() => setShowEditor(false)} isSaving={isSaving} />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <SnippetList
        snippets={snippets}
        isLoading={isLoading}
        onToggleFavorite={handleToggleFavorite}
        onDelete={deleteSnippet}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{total} snippets</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setFilters({ page: page - 1 })}>← Prev</Button>
            <span className="flex items-center px-2">{page} / {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setFilters({ page: page + 1 })}>Next →</Button>
          </div>
        </div>
      )}
    </div>
  );
}
