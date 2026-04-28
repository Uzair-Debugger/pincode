import { Prisma } from '@prisma/client';
import { prisma } from '../services/prisma.service';

export interface SnippetFilters {
  userId: string;
  language?: string;
  tagId?: string;
  isFavorite?: boolean;
  search?: string;
  page: number;
  limit: number;
}

// Raw row shape returned by the FTS query
interface FtsRow {
  id: string;
  rank: number;
}

/**
 * Full-text search across title (A), description (B), code (C), and tag names.
 * Returns snippet IDs ordered by ts_rank descending.
 *
 * Strategy:
 *  - search_vector covers title/description/code via a GIN-indexed generated column
 *  - tag names are matched with a separate EXISTS subquery using plainto_tsquery
 *  - plainto_tsquery is used (not to_tsquery) so raw user input never causes syntax errors
 */
async function ftsSearch(userId: string, search: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<FtsRow[]>`
    SELECT s.id, ts_rank(s.search_vector, query) AS rank
    FROM   snippets s,
           plainto_tsquery('english', ${search}) query
    WHERE  s."userId" = ${userId}
      AND  (
             s.search_vector @@ query
             OR EXISTS (
               SELECT 1
               FROM   snippet_tags st
               JOIN   tags t ON t.id = st."tagId"
               WHERE  st."snippetId" = s.id
                 AND  to_tsvector('english', t.name) @@ query
             )
           )
    ORDER  BY rank DESC
  `;
  return rows.map((r) => r.id);
}

export const snippetRepository = {
  async create(userId: string, data: Prisma.SnippetCreateInput, tagIds?: string[], noteBodies?: string[]) {
    return prisma.snippet.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        snippetTags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
          : undefined,
        notes: noteBodies?.length
          ? { create: noteBodies.map((body) => ({ body })) }
          : undefined,
      },
      include: { snippetTags: { include: { tag: true } }, notes: true },
    });
  },

  async findMany({ userId, language, tagId, isFavorite, search, page, limit }: SnippetFilters) {
    // When a search term is present, resolve matching IDs via FTS first,
    // then filter the Prisma query to those IDs (preserving rank order via `in`).
    let rankedIds: string[] | undefined;
    if (search?.trim()) {
      rankedIds = await ftsSearch(userId, search.trim());
      // No matches — return empty page immediately without hitting the DB again
      if (rankedIds.length === 0) {
        return { items: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    const where: Prisma.SnippetWhereInput = {
      userId,
      ...(language && { language }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(tagId && { snippetTags: { some: { tagId } } }),
      ...(rankedIds && { id: { in: rankedIds } }),
    };

    const [total, items] = await Promise.all([
      prisma.snippet.count({ where }),
      prisma.snippet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        // When searching: sort by rank (position in rankedIds array).
        // When not searching: sort by newest first.
        orderBy: rankedIds ? undefined : { createdAt: 'desc' },
        include: { snippetTags: { include: { tag: true } }, notes: true },
      }),
    ]);

    // Re-apply rank order after Prisma returns results (Prisma doesn't support ORDER BY array position)
    if (rankedIds) {
      const order = new Map(rankedIds.map((id, i) => [id, i]));
      items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findOne(id: string, userId: string) {
    return prisma.snippet.findFirst({
      where: { id, userId },
      include: { snippetTags: { include: { tag: true } }, notes: true },
    });
  },

  async update(id: string, userId: string, data: Prisma.SnippetUpdateInput, tagIds?: string[]) {
    if (tagIds !== undefined) {
      await prisma.snippetTag.deleteMany({ where: { snippetId: id } });
    }
    return prisma.snippet.update({
      where: { id },
      data: {
        ...data,
        ...(tagIds !== undefined && {
          snippetTags: { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) },
        }),
      },
      include: { snippetTags: { include: { tag: true } }, notes: true },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.snippet.deleteMany({ where: { id, userId } });
  },
};
