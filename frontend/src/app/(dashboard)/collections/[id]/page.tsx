'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collectionService } from '@/services/collectionService';
import { useSnippets } from '@/hooks/useSnippets';
import { SnippetList } from '@/components/snippets/SnippetList';
import type { Collection } from '@/types/domain';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const { snippets, isLoading, updateSnippet, deleteSnippet } = useSnippets();

  useEffect(() => {
    collectionService.getOne(id).then(setCollection).catch(console.error);
  }, [id]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{collection?.name ?? '…'}</h1>
        {collection?.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{collection.description}</p>
        )}
      </div>
      <SnippetList
        snippets={snippets}
        isLoading={isLoading}
        onToggleFavorite={(snippetId, current) => updateSnippet(snippetId, { isFavorite: !current })}
        onDelete={deleteSnippet}
      />
    </div>
  );
}
