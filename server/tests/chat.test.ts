import request from 'supertest';
import app from '../src/index';

describe('POST /api/chat', () => {
  it('returns 400 when messages is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ provider: 'groq' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_INPUT');
  });

  it('returns 400 when provider is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'hello' }] });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_INPUT');
  });

  it('returns 400 when messages is empty array', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messages: [], provider: 'groq' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_INPUT');
  });

  it('returns 502 when provider is not configured', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'hello' }], provider: 'groq' });
    // Without GROQ_API_KEY, it should return 502
    if (!process.env.GROQ_API_KEY) {
      expect(res.status).toBe(502);
      expect(res.body.code).toBe('PROVIDER_NOT_CONFIGURED');
    }
  });
});

describe('POST /api/test', () => {
  it('returns 400 when provider is missing', async () => {
    const res = await request(app)
      .post('/api/test')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_INPUT');
  });

  it('returns status object for unknown provider', async () => {
    const res = await request(app)
      .post('/api/test')
      .send({ provider: 'unknown' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('error');
  });
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
