-- Add a generated tsvector column that combines title (weight A), description (weight B), and code (weight C).
-- Weights control ranking: A > B > C, so title matches rank higher than code matches.
ALTER TABLE "snippets"
  ADD COLUMN "search_vector" tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
      setweight(to_tsvector('english', coalesce("description", '')), 'B') ||
      setweight(to_tsvector('english', coalesce("code", '')), 'C')
    ) STORED;

-- GIN index on the generated column — O(1) lookup vs O(n) sequential scan with LIKE.
CREATE INDEX "snippets_search_vector_idx" ON "snippets" USING GIN ("search_vector");
