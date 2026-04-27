/**
 * prisma/seed.ts
 * Validates every model and relationship defined in schema.prisma.
 * Run: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  ✓ ${message}`);
}

async function main() {
  console.log("\n── Cleaning previous seed data ──");
  // Delete in dependency order to avoid FK violations
  await prisma.snippetCollection.deleteMany();
  await prisma.snippetTag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.snippet.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany({ where: { email: "seed@pincode.dev" } });

  // ── 1. User ────────────────────────────────────────────────────────────────
  console.log("\n── 1. User ──");
  const user = await prisma.user.create({
    data: { email: "seed@pincode.dev", name: "Seed User" },
  });
  assert(!!user.id, "User created with cuid id");
  assert(user.email === "seed@pincode.dev", "User email stored correctly");

  // ── 2. Snippet (1:N with User) ─────────────────────────────────────────────
  console.log("\n── 2. Snippet ──");
  const snippet = await prisma.snippet.create({
    data: {
      title: "Hello World",
      code: 'console.log("hello")',
      language: "typescript",
      userId: user.id,
    },
  });
  assert(snippet.userId === user.id, "Snippet linked to user (1:N)");
  assert(snippet.isPublic === false, "isPublic defaults to false");
  assert(snippet.isFavorite === false, "isFavorite defaults to false");

  // ── 3. Note (1:N with Snippet) ─────────────────────────────────────────────
  console.log("\n── 3. Note ──");
  const note = await prisma.note.create({
    data: { body: "First note on this snippet", snippetId: snippet.id },
  });
  assert(note.snippetId === snippet.id, "Note linked to snippet (1:N)");

  const notes = await prisma.note.findMany({ where: { snippetId: snippet.id } });
  assert(notes.length === 1, "Snippet has 1 note");

  // ── 4. Tag (scoped per user) ───────────────────────────────────────────────
  console.log("\n── 4. Tag ──");
  const tag = await prisma.tag.create({
    data: { name: "typescript", color: "#3178c6", userId: user.id },
  });
  assert(tag.userId === user.id, "Tag scoped to user");

  // Duplicate tag name for same user must fail
  let duplicateTagError = false;
  try {
    await prisma.tag.create({ data: { name: "typescript", userId: user.id } });
  } catch {
    duplicateTagError = true;
  }
  assert(duplicateTagError, "Duplicate tag name per user is rejected (unique constraint)");

  // ── 5. SnippetTag (M:N) ────────────────────────────────────────────────────
  console.log("\n── 5. SnippetTag (M:N) ──");
  const snippetTag = await prisma.snippetTag.create({
    data: { snippetId: snippet.id, tagId: tag.id },
  });
  assert(snippetTag.snippetId === snippet.id, "SnippetTag join created");

  const taggedSnippets = await prisma.snippet.findMany({
    where: { snippetTags: { some: { tagId: tag.id } } },
  });
  assert(taggedSnippets.length === 1, "Can query snippets by tag");

  // ── 6. Collection (1:N with User + nested folders) ─────────────────────────
  console.log("\n── 6. Collection ──");
  const rootCol = await prisma.collection.create({
    data: { name: "My Snippets", userId: user.id },
  });
  assert(!rootCol.parentId, "Root collection has no parent");

  const childCol = await prisma.collection.create({
    data: { name: "React Hooks", userId: user.id, parentId: rootCol.id },
  });
  assert(childCol.parentId === rootCol.id, "Child collection linked to parent (nested folders)");

  const children = await prisma.collection.findMany({
    where: { parentId: rootCol.id },
  });
  assert(children.length === 1, "Root collection has 1 child");

  // ── 7. SnippetCollection (M:N) ─────────────────────────────────────────────
  console.log("\n── 7. SnippetCollection (M:N) ──");
  await prisma.snippetCollection.create({
    data: { snippetId: snippet.id, collectionId: childCol.id },
  });

  const colSnippets = await prisma.snippet.findMany({
    where: { snippetCols: { some: { collectionId: childCol.id } } },
  });
  assert(colSnippets.length === 1, "Can query snippets inside a collection");

  // ── 8. Cascade delete ──────────────────────────────────────────────────────
  console.log("\n── 8. Cascade delete ──");
  await prisma.user.delete({ where: { id: user.id } });

  const orphanSnippets = await prisma.snippet.findMany({ where: { userId: user.id } });
  const orphanNotes    = await prisma.note.findMany({ where: { id: note.id } });
  const orphanTags     = await prisma.tag.findMany({ where: { userId: user.id } });
  const orphanCols     = await prisma.collection.findMany({ where: { userId: user.id } });

  assert(orphanSnippets.length === 0, "Snippets cascade-deleted with user");
  assert(orphanNotes.length === 0,    "Notes cascade-deleted with snippet");
  assert(orphanTags.length === 0,     "Tags cascade-deleted with user");
  assert(orphanCols.length === 0,     "Collections cascade-deleted with user");

  // ── 9. Search / filter indexes ─────────────────────────────────────────────
  console.log("\n── 9. Search & filter queries (index smoke test) ──");
  const u2 = await prisma.user.create({ data: { email: "seed@pincode.dev", name: "Seed User" } });
  await prisma.snippet.createMany({
    data: [
      { title: "Fetch API",    code: "fetch('/api')", language: "javascript", userId: u2.id, isFavorite: true },
      { title: "useEffect",    code: "useEffect(()=>{})",  language: "typescript", userId: u2.id },
      { title: "SQL Select",   code: "SELECT * FROM t",    language: "sql",        userId: u2.id },
    ],
  });

  const byLang = await prisma.snippet.findMany({ where: { userId: u2.id, language: "typescript" } });
  assert(byLang.length === 1, "Filter by language works");

  const favorites = await prisma.snippet.findMany({ where: { userId: u2.id, isFavorite: true } });
  assert(favorites.length === 1, "Filter by isFavorite works");

  const byTitle = await prisma.snippet.findMany({
    where: { userId: u2.id, title: { contains: "use", mode: "insensitive" } },
  });
  assert(byTitle.length === 1, "Case-insensitive title search works");

  // cleanup u2
  await prisma.user.delete({ where: { id: u2.id } });

  console.log("\n✅  All tests passed.\n");
}

main()
  .catch((e) => { console.error("\n❌  Seed failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
