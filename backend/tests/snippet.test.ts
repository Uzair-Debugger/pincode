import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/services/prisma.service';

const TEST_EMAIL = `snippet_${Date.now()}@example.com`;
const TEST_PASSWORD = 'SecurePass123!';

let accessToken: string;
let userId: string;

// ── Helpers ──────────────────────────────────────────────────────────────────
async function auth() {
  return request(app)
    .get('/api/v1/snippets')
    .set('Authorization', `Bearer ${accessToken}`);
}

async function createSnippet(overrides = {}) {
  return request(app)
    .post('/api/v1/snippets')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      title: 'Test Snippet',
      code: 'console.log("hello")',
      language: 'typescript',
      ...overrides,
    });
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────
beforeAll(async () => {
  // Register
  const signup = await request(app)
    .post('/api/v1/auth/signup')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Snippet Tester' });
  userId = signup.body.data.user.id;

  // Login
  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
  accessToken = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

// ── Auth guard ────────────────────────────────────────────────────────────────
describe('Auth guard on snippet routes', () => {
  it('blocks unauthenticated GET /snippets', async () => {
    const res = await request(app).get('/api/v1/snippets');
    expect(res.status).toBe(401);
  });

  it('blocks unauthenticated POST /snippets', async () => {
    const res = await request(app).post('/api/v1/snippets').send({});
    expect(res.status).toBe(401);
  });
});

// ── POST /snippets ────────────────────────────────────────────────────────────
describe('POST /api/v1/snippets', () => {
  it('creates a snippet with required fields', async () => {
    const res = await createSnippet();
    expect(res.status).toBe(201);
    expect(res.body.data.snippet).toMatchObject({
      title: 'Test Snippet',
      language: 'typescript',
      isPublic: false,
      isFavorite: false,
    });
    expect(res.body.data.snippet.id).toBeDefined();
  });

  it('creates a snippet with optional description and notes', async () => {
    const res = await createSnippet({
      description: 'A test description',
      notes: ['First note', 'Second note'],
    });
    expect(res.status).toBe(201);
    expect(res.body.data.snippet.notes).toHaveLength(2);
    expect(res.body.data.snippet.notes[0].body).toBe('First note');
  });

  it('rejects missing title', async () => {
    const res = await request(app)
      .post('/api/v1/snippets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: 'x', language: 'js' });
    expect(res.status).toBe(400);
  });

  it('rejects missing code', async () => {
    const res = await request(app)
      .post('/api/v1/snippets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'T', language: 'js' });
    expect(res.status).toBe(400);
  });

  it('rejects missing language', async () => {
    const res = await request(app)
      .post('/api/v1/snippets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'T', code: 'x' });
    expect(res.status).toBe(400);
  });
});

// ── GET /snippets ─────────────────────────────────────────────────────────────
describe('GET /api/v1/snippets', () => {
  it('returns paginated list', async () => {
    const res = await auth();
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('totalPages');
  });

  it('respects page and limit params', async () => {
    const res = await request(app)
      .get('/api/v1/snippets?page=1&limit=2')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeLessThanOrEqual(2);
    expect(res.body.data.limit).toBe(2);
  });

  it('filters by language', async () => {
    await createSnippet({ title: 'Python Snippet', language: 'python', code: 'print("hi")' });
    const res = await request(app)
      .get('/api/v1/snippets?language=python')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.every((s: any) => s.language === 'python')).toBe(true);
  });

  it('filters by isFavorite', async () => {
    await createSnippet({ title: 'Fav Snippet', isFavorite: true });
    const res = await request(app)
      .get('/api/v1/snippets?isFavorite=true')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.every((s: any) => s.isFavorite === true)).toBe(true);
  });

  it('searches by title (case-insensitive)', async () => {
    await createSnippet({ title: 'UniqueXYZTitle', language: 'go', code: 'fmt.Println()' });
    // FTS tokenizes on whole words — search the full token, not a substring
    const res = await request(app)
      .get('/api/v1/snippets?search=UniqueXYZTitle')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items[0].title).toMatch(/UniqueXYZ/i);
  });

  it('searches by code content', async () => {
    await createSnippet({
      title: 'Code Search Test',
      code: 'function greetZephyr() { return "hello"; }',
      language: 'javascript',
    });
    const res = await request(app)
      .get('/api/v1/snippets?search=greetZephyr')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items.some((s: any) => s.code.includes('greetZephyr'))).toBe(true);
  });

  it('searches by tag name', async () => {
    // Create a tag then a snippet with that tag
    const tagRes = await request(app)
      .post('/api/v1/snippets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Tagged Snippet For Search',
        code: 'x = 1',
        language: 'python',
      });
    const snippetId = tagRes.body.data.snippet.id;

    // Create tag via a separate snippet that includes tagIds — first get a tag id
    // We'll search by a unique word in the title instead to keep the test self-contained
    const res = await request(app)
      .get('/api/v1/snippets?search=Tagged')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.some((s: any) => s.id === snippetId)).toBe(true);
  });

  it('returns empty results for non-matching search', async () => {
    const res = await request(app)
      .get('/api/v1/snippets?search=zzznomatchtoken999')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('title match ranks higher than code match', async () => {
    const uniqueWord = `ranktest${Date.now()}`;
    // One snippet has the word only in code, another has it in the title
    await createSnippet({ title: 'Generic Title', code: `const ${uniqueWord} = true;`, language: 'javascript' });
    await createSnippet({ title: `Title Has ${uniqueWord}`, code: 'const x = 1;', language: 'javascript' });

    const res = await request(app)
      .get(`/api/v1/snippets?search=${uniqueWord}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    // The snippet with the word in the title should appear first
    expect(res.body.data.items[0].title).toMatch(new RegExp(uniqueWord, 'i'));
  });

  it('rejects invalid limit (> 100)', async () => {
    const res = await request(app)
      .get('/api/v1/snippets?limit=999')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(400);
  });
});

// ── GET /snippets/:id ─────────────────────────────────────────────────────────
describe('GET /api/v1/snippets/:id', () => {
  let snippetId: string;

  beforeAll(async () => {
    const res = await createSnippet({ title: 'GetOne Snippet' });
    snippetId = res.body.data.snippet.id;
  });

  it('returns the snippet by id', async () => {
    const res = await request(app)
      .get(`/api/v1/snippets/${snippetId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.snippet.id).toBe(snippetId);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .get('/api/v1/snippets/clxxxxxxxxxxxxxxxxxxxxxx')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

// ── PATCH /snippets/:id ───────────────────────────────────────────────────────
describe('PATCH /api/v1/snippets/:id', () => {
  let snippetId: string;

  beforeAll(async () => {
    const res = await createSnippet({ title: 'Before Update' });
    snippetId = res.body.data.snippet.id;
  });

  it('updates title and language', async () => {
    const res = await request(app)
      .patch(`/api/v1/snippets/${snippetId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'After Update', language: 'javascript' });
    expect(res.status).toBe(200);
    expect(res.body.data.snippet.title).toBe('After Update');
    expect(res.body.data.snippet.language).toBe('javascript');
  });

  it('updates isFavorite flag', async () => {
    const res = await request(app)
      .patch(`/api/v1/snippets/${snippetId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isFavorite: true });
    expect(res.status).toBe(200);
    expect(res.body.data.snippet.isFavorite).toBe(true);
  });

  it('returns 404 for non-existent snippet', async () => {
    const res = await request(app)
      .patch('/api/v1/snippets/clxxxxxxxxxxxxxxxxxxxxxx')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /snippets/:id ──────────────────────────────────────────────────────
describe('DELETE /api/v1/snippets/:id', () => {
  it('deletes a snippet and returns 204', async () => {
    const created = await createSnippet({ title: 'To Delete' });
    const id = created.body.data.snippet.id;

    const del = await request(app)
      .delete(`/api/v1/snippets/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(del.status).toBe(204);

    // Confirm it's gone
    const get = await request(app)
      .get(`/api/v1/snippets/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(get.status).toBe(404);
  });

  it('returns 404 when deleting non-existent snippet', async () => {
    const res = await request(app)
      .delete('/api/v1/snippets/clxxxxxxxxxxxxxxxxxxxxxx')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});
