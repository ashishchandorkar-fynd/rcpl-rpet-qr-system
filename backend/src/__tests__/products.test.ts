import request from 'supertest';
import express from 'express';
import { getTestDb } from '../database';
import productsRouter from '../routes/products';
import { errorHandler } from '../middleware/errorHandler';

// Override the db for testing
jest.mock('../database', () => ({
  getDb: jest.fn(),
  getTestDb: jest.requireActual('../database').getTestDb,
}));

import { getDb } from '../database';

let testDb: ReturnType<typeof getTestDb>;

beforeAll(() => {
  testDb = getTestDb();
  (getDb as jest.Mock).mockReturnValue(testDb);
});

afterAll(() => {
  testDb.close();
});

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);
app.use(errorHandler);

describe('GET /api/products/lookup', () => {
  it('returns product data for valid active code', async () => {
    const res = await request(app).get('/api/products/lookup?code=AA');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.batch_code).toBe('AA');
    expect(res.body.data.category).toBe('Dairy');
    expect(res.body.data.fssai_license).toBe('11518999000111');
  });

  it('is case-insensitive: lowercase code returns same result', async () => {
    const res = await request(app).get('/api/products/lookup?code=aa');
    expect(res.status).toBe(200);
    expect(res.body.data.batch_code).toBe('AA');
  });

  it('returns 400 for inactive product', async () => {
    const res = await request(app).get('/api/products/lookup?code=CC');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not currently available/i);
  });

  it('returns 404 for non-existent code', async () => {
    const res = await request(app).get('/api/products/lookup?code=ZZ');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when code param is missing', async () => {
    const res = await request(app).get('/api/products/lookup');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for non-alphanumeric code (SQL injection attempt)', async () => {
    const res = await request(app).get('/api/products/lookup?code=AA;DROP TABLE');
    expect(res.status).toBe(400);
  });

  it('response shape has required fields', async () => {
    const res = await request(app).get('/api/products/lookup?code=BB');
    const { data } = res.body;
    expect(data).toHaveProperty('batch_code');
    expect(data).toHaveProperty('vendor_name');
    expect(data).toHaveProperty('fssai_license');
    expect(data).toHaveProperty('status', 'active');
  });
});
