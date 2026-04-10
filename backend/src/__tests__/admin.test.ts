import request from 'supertest';
import express from 'express';
import { getTestDb } from '../database';
import adminRouter from '../routes/admin';
import { errorHandler } from '../middleware/errorHandler';

jest.mock('../database', () => ({
  getDb: jest.fn(),
  getTestDb: jest.requireActual('../database').getTestDb,
}));

import { getDb } from '../database';

let testDb: ReturnType<typeof getTestDb>;

beforeEach(() => {
  testDb = getTestDb();
  (getDb as jest.Mock).mockReturnValue(testDb);
});

afterEach(() => {
  testDb.close();
});

const app = express();
app.use(express.json());
app.use('/api/admin/products', adminRouter);
app.use(errorHandler);

const validProduct = {
  batch_code: 'DD',
  category: 'Dairy',
  subcategory: 'Buffalo Milk',
  vendor_name: 'Test Vendor',
  vendor_address: '123 Test Street, Mumbai - 400001',
  fssai_license: '12345678901234',
  status: 'active',
};

describe('POST /api/admin/products', () => {
  it('creates a product and returns 201', async () => {
    const res = await request(app).post('/api/admin/products').send(validProduct);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.batch_code).toBe('DD');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/admin/products').send({ batch_code: 'EE' });
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate batch_code', async () => {
    await request(app).post('/api/admin/products').send(validProduct);
    const res = await request(app).post('/api/admin/products').send(validProduct);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('returns 400 for FSSAI license not 14 digits', async () => {
    const res = await request(app).post('/api/admin/products').send({ ...validProduct, fssai_license: '1234' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/14 digits/i);
  });
});

describe('GET /api/admin/products', () => {
  it('lists all products with pagination', async () => {
    const res = await request(app).get('/api/admin/products');
    expect(res.status).toBe(200);
    expect(res.body.data.data).toBeInstanceOf(Array);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('totalPages');
  });

  it('respects page and limit query params', async () => {
    const res = await request(app).get('/api/admin/products?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBeLessThanOrEqual(2);
    expect(res.body.data.limit).toBe(2);
  });
});

describe('GET /api/admin/products/:id', () => {
  it('returns single product by id', async () => {
    const list = await request(app).get('/api/admin/products');
    const firstId = list.body.data.data[0].id;
    const res = await request(app).get(`/api/admin/products/${firstId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(firstId);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).get('/api/admin/products/99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/admin/products/:id', () => {
  it('updates product fields', async () => {
    const list = await request(app).get('/api/admin/products');
    const firstId = list.body.data.data[0].id;
    const res = await request(app).put(`/api/admin/products/${firstId}`).send({ vendor_name: 'Updated Vendor' });
    expect(res.status).toBe(200);
    expect(res.body.data.vendor_name).toBe('Updated Vendor');
  });
});

describe('DELETE /api/admin/products/:id', () => {
  it('soft-deletes (deactivates) product', async () => {
    const list = await request(app).get('/api/admin/products');
    const firstId = list.body.data.data[0].id;
    const res = await request(app).delete(`/api/admin/products/${firstId}`);
    expect(res.status).toBe(200);
    const check = await request(app).get(`/api/admin/products/${firstId}`);
    expect(check.body.data.status).toBe('inactive');
  });
});
