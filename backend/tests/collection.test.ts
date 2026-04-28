import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/services/prisma.service';

const TEST_EMAIL = `col_${Date.now()}@example.com`;
const TEST_PASSWORD = 'SecurePass123!';

let accessToken: string;
let snippetId: string;

async function createCollection(overrides = {}) {
  return request(app)
    .post('/api/v1/collections')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'My Collection', ...overrides });
}

beforeAll(async () => {
  await request(app)
    .post('/api/v1/auth/signup')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Col Tester' });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
  accessToken = login.body.data.accessToken;

  // Create a snippet to use in collection tests
  const snippet = await request(app)
    .post('/api/v1/snippets')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ title: 'Col Snippet', code: 'x', language: 'typescript' });
  snippetId = snippet.body.data.snippet.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

// ── Auth guard ────────────────────────────────────────────────────────────────
describe('Auth guard on collection routes', () => {
  it('blocks unauthenticated GET /collections', async () => {
    const res = await request(app).get('/api/v1/collections');
    expect(res.status).toBe(401);
  });
});

// ── POST /collections ─────────────────────────────────────────────────────────
describe('POST /api/v1/collections', () => {
  it('creates a root collection', async () => {
    const res = await createCollection({ name: 'Root Col' });
    expect(res.status).toBe(201);
    expect(res.body.data.collection.name).toBe('Root Col');
    expect(res.body.data.collection.parentId).toBeNull();
  });

  it('creates a nested (child) collection', async () => {
    const parent = await createCollection({ name: 'Parent' });
    const parentId = parent.body.data.collection.id;

    const child = await createCollection({ name: 'Child', parentId });
    expect(child.status).toBe(201);
    expect(child.body.data.collection.parentId).toBe(parentId);
  });

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'no name' });
    expect(res.status).toBe(400);
  });

  it('rejects name exceeding 100 chars', async () => {
    const res = await createCollection({ name: 'x'.repeat(101) });
    expect(res.status).toBe(400);
  });
});

// ── GET /collections ──────────────────────────────────────────────────────────
describe('GET /api/v1/collections', () => {
  it('returns all collections for the user', async () => {
    const res = await request(app)
      .get('/api/v1/collections')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.collections)).toBe(true);
  });
});

// ── GET /collections/:id ──────────────────────────────────────────────────────
describe('GET /api/v1/collections/:id', () => {
  let colId: string;

  beforeAll(async () => {
    const res = await createCollection({ name: 'GetOne Col' });
    colId = res.body.data.collection.id;
  });

  it('returns the collection by id', async () => {
    const res = await request(app)
      .get(`/api/v1/collections/${colId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.collection.id).toBe(colId);
  });

  it('returns 404 for non-existent collection', async () => {
    const res = await request(app)
      .get('/api/v1/collections/clxxxxxxxxxxxxxxxxxxxxxx')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

// ── PATCH /collections/:id ────────────────────────────────────────────────────
describe('PATCH /api/v1/collections/:id', () => {
  let colId: string;

  beforeAll(async () => {
    const res = await createCollection({ name: 'Before Patch' });
    colId = res.body.data.collection.id;
  });

  it('updates collection name', async () => {
    const res = await request(app)
      .patch(`/api/v1/collections/${colId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'After Patch' });
    expect(res.status).toBe(200);
    expect(res.body.data.collection.name).toBe('After Patch');
  });

  it('returns 404 for non-existent collection', async () => {
    const res = await request(app)
      .patch('/api/v1/collections/clxxxxxxxxxxxxxxxxxxxxxx')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /collections/:id ───────────────────────────────────────────────────
describe('DELETE /api/v1/collections/:id', () => {
  it('deletes a collection and returns 204', async () => {
    const created = await createCollection({ name: 'To Delete' });
    const id = created.body.data.collection.id;

    const del = await request(app)
      .delete(`/api/v1/collections/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/api/v1/collections/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(get.status).toBe(404);
  });

  it('returns 404 for non-existent collection', async () => {
    const res = await request(app)
      .delete('/api/v1/collections/clxxxxxxxxxxxxxxxxxxxxxx')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

// ── POST /collections/:id/snippets ────────────────────────────────────────────
describe('POST /api/v1/collections/:id/snippets', () => {
  let colId: string;

  beforeAll(async () => {
    const res = await createCollection({ name: 'Snippet Col' });
    colId = res.body.data.collection.id;
  });

  it('adds a snippet to a collection', async () => {
    const res = await request(app)
      .post(`/api/v1/collections/${colId}/snippets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ snippetId });
    expect(res.status).toBe(201);
    expect(res.body.message).not.toBe('error');
  });

  it('rejects invalid snippetId format', async () => {
    const res = await request(app)
      .post(`/api/v1/collections/${colId}/snippets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ snippetId: 'not-a-cuid' });
    expect(res.status).toBe(400);
  });
});

// ── DELETE /collections/:id/snippets ─────────────────────────────────────────
describe('DELETE /api/v1/collections/:id/snippets', () => {
  let colId: string;

  beforeAll(async () => {
    const col = await createCollection({ name: 'Remove Snippet Col' });
    colId = col.body.data.collection.id;
    // Add snippet first
    await request(app)
      .post(`/api/v1/collections/${colId}/snippets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ snippetId });
  });

  it('removes a snippet from a collection and returns 204', async () => {
    const res = await request(app)
      .delete(`/api/v1/collections/${colId}/snippets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ snippetId });
    expect(res.status).toBe(204);
  });
});
