'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import type { Snippet, CreateSnippetInput } from '@/types/domain';

const LANGUAGES = ['typescript', 'javascript', 'python', 'rust', 'go', 'java', 'c', 'cpp', 'bash', 'sql', 'json', 'yaml', 'markdown'];

interface SnippetEditorProps {
  initial?: Partial<Snippet>;
  onSave: (input: CreateSnippetInput) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function SnippetEditor({ initial, onSave, onCancel, isSaving }: SnippetEditorProps) {
  const [form, setForm] = useState<CreateSnippetInput>({
    title: initial?.title ?? '',
    code: initial?.code ?? '',
    language: initial?.language ?? 'typescript',
    description: initial?.description ?? '',
    isPublic: initial?.isPublic ?? false,
    isFavorite: initial?.isFavorite ?? false,
  });
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateSnippetInput>(key: K, value: CreateSnippetInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.code.trim()) {
      setError('Title and code are required.');
      return;
    }
    setError(null);
    await onSave(form);
  };

  const fieldClass = cn(
    'w-full rounded-lg border border-gray-200 dark:border-gray-700',
    'bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none',
    'focus:ring-2 focus:ring-blue-500 transition-shadow'
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <input
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="Snippet title"
        className={fieldClass}
        required
      />

      <div className="flex gap-3">
        <select value={form.language} onChange={(e) => set('language', e.target.value)} className={cn(fieldClass, 'w-44')}>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={form.isFavorite} onChange={(e) => set('isFavorite', e.target.checked)} className="rounded" />
          Favorite
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} className="rounded" />
          Public
        </label>
      </div>

      <textarea
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className={fieldClass}
      />

      <textarea
        value={form.code}
        onChange={(e) => set('code', e.target.value)}
        placeholder="Paste your code here…"
        rows={14}
        spellCheck={false}
        className={cn(fieldClass, 'font-mono text-xs resize-y')}
        required
      />

      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save snippet'}
        </Button>
      </div>
    </form>
  );
}
