import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/services/prisma.service';

const TEST_EMAIL = `note_${Date.now()}@example.com`;
const TEST_PASSWORD = 'SecurePass123!';

let accessToken: string;
let snippetId: string;

async function createNote(sId: string, body: string, token = accessToken) {
  return request(app)
    .post(`/api/v1/snippets/${sId}/notes`)
    .set('Authorization', `Bearer ${token}`)
    .send({ body });
}

beforeAll(async () => {
  await request(app)
    .post('/api/v1/auth/signup')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Note Tester' });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
  accessToken = login.body.data.accessToken;

  // Create a snippet to attach notes to
  const snippet = await request(app)
    .post('/api/v1/snippets')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ title: 'Note Parent', code: 'x', language: 'typescript' });
  snippetId = snippet.body.data.snippet.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

// ── POST /snippets/:id/notes ──────────────────────────────────────────────────
describe('POST /api/v1/snippets/:snippetId/notes', () => {
  it('adds a note to a snippet', async () => {
    const res = await createNote(snippetId, 'My first note');
    expect(res.status).toBe(201);
    expect(res.body.data.note.body).toBe('My first note');
    expect(res.body.data.note.snippetId).toBe(snippetId);
  });

  it('rejects empty body', async () => {
    const res = await createNote(snippetId, '');
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent snippet', async () => {
    const res = await createNote('clxxxxxxxxxxxxxxxxxxxxxx', 'orphan note');
    expect(res.status).toBe(404);
  });
});

// ── GET /snippets/:id/notes ───────────────────────────────────────────────────
describe('GET /api/v1/snippets/:snippetId/notes', () => {
  it('returns all notes for a snippet', async () => {
    await createNote(snippetId, 'Note A');
    await createNote(snippetId, 'Note B');

    const res = await request(app)
      .get(`/api/v1/snippets/${snippetId}/notes`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.notes)).toBe(true);
    expect(res.body.data.notes.length).toBeGreaterThanOrEqual(2);
  });

  it('returns 404 for non-existent snippet', async () => {
    const res = await request(app)
      .get('/api/v1/snippets/clxxxxxxxxxxxxxxxxxxxxxx/notes')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

// ── PATCH /snippets/:id/notes/:noteId ────────────────────────────────────────
describe('PATCH /api/v1/snippets/:snippetId/notes/:noteId', () => {
  let noteId: string;

  beforeAll(async () => {
    const res = await createNote(snippetId, 'Original body');
    noteId = res.body.data.note.id;
  });

  it('updates the note body', async () => {
    const res = await request(app)
      .patch(`/api/v1/snippets/${snippetId}/notes/${noteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ body: 'Updated body' });
    expect(res.status).toBe(200);
    expect(res.body.data.note.body).toBe('Updated body');
  });

  it('rejects empty body on update', async () => {
    const res = await request(app)
      .patch(`/api/v1/snippets/${snippetId}/notes/${noteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ body: '' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent note', async () => {
    const res = await request(app)
      .patch(`/api/v1/snippets/${snippetId}/notes/clxxxxxxxxxxxxxxxxxxxxxx`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ body: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /snippets/:id/notes/:noteId ───────────────────────────────────────
describe('DELETE /api/v1/snippets/:snippetId/notes/:noteId', () => {
  it('deletes a note and returns 204', async () => {
    const created = await createNote(snippetId, 'To be deleted');
    const noteId = created.body.data.note.id;

    const del = await request(app)
      .delete(`/api/v1/snippets/${snippetId}/notes/${noteId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(del.status).toBe(204);
  });

  it('returns 404 for non-existent note', async () => {
    const res = await request(app)
      .delete(`/api/v1/snippets/${snippetId}/notes/clxxxxxxxxxxxxxxxxxxxxxx`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});
