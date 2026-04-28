'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { snippetService } from '@/services/snippetService';
import { SnippetEditor } from '@/components/snippets/SnippetEditor';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { Button } from '@/components/ui/Button';
import type { Snippet, CreateSnippetInput } from '@/types/domain';

export default function SnippetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    snippetService.getOne(id)
      .then(setSnippet)
      .catch(() => setError('Snippet not found.'));
  }, [id]);

  const handleSave = async (input: CreateSnippetInput) => {
    setIsSaving(true);
    try {
      const updated = await snippetService.update(id, input);
      setSnippet(updated);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this snippet?')) return;
    await snippetService.delete(id);
    router.push('/snippets');
  };

  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!snippet) return <div className="size-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mt-20" />;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{snippet.title}</h1>
          <div className="flex items-center gap-2">
            <LanguageBadge language={snippet.language} />
            {snippet.isFavorite && <span className="text-yellow-400 text-sm">★ Favorite</span>}
            {snippet.isPublic && <span className="text-xs text-gray-400">Public</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {snippet.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{snippet.description}</p>
      )}

      {isEditing ? (
        <SnippetEditor initial={snippet} onSave={handleSave} onCancel={() => setIsEditing(false)} isSaving={isSaving} />
      ) : (
        <pre className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
          <code>{snippet.code}</code>
        </pre>
      )}

      {snippet.snippetTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {snippet.snippetTags.map(({ tag }) => (
            <span key={tag.id} className="rounded-full px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Updated {new Date(snippet.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
