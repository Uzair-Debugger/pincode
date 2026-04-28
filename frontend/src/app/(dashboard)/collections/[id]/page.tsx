'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collectionService } from '@/services/collectionService';
import { snippetService } from '@/services/snippetService';
import { SnippetList } from '@/components/snippets/SnippetList';
import { SnippetEditor } from '@/components/snippets/SnippetEditor';
import { Button } from '@/components/ui/Button';
import type { Collection, Snippet, CreateSnippetInput } from '@/types/domain';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    collectionService.getOne(id)
      .then((col) => {
        setCollection(col);
        setSnippets((col as Collection & { snippetCols?: { snippet: Snippet }[] }).snippetCols?.map((sc) => sc.snippet) ?? []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCreate = async (input: CreateSnippetInput) => {
    setIsSaving(true);
    try {
      const snippet = await snippetService.create(input);
      await collectionService.addSnippet(id, snippet.id);
      setSnippets((prev) => [snippet, ...prev]);
      setShowEditor(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async (snippetId: string, current: boolean) => {
    const updated = await snippetService.update(snippetId, { isFavorite: !current });
    setSnippets((prev) => prev.map((s) => (s.id === snippetId ? updated : s)));
  };

  const handleDelete = async (snippetId: string) => {
    await snippetService.delete(snippetId);
    setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{collection?.name ?? '…'}</h1>
          {collection?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{collection.description}</p>
          )}
        </div>
        <Button size="sm" onClick={() => setShowEditor(true)}>+ New snippet</Button>
      </div>

      {showEditor && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-semibold mb-4">New snippet</h2>
          <SnippetEditor onSave={handleCreate} onCancel={() => setShowEditor(false)} isSaving={isSaving} />
        </div>
      )}

      <SnippetList
        snippets={snippets}
        isLoading={isLoading}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
      />
    </div>
  );
}
