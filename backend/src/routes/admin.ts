import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { getDb } from '../database';
import { RpetProduct, CreateProductDto, UpdateProductDto } from '../types';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

const productValidation = [
  body('batch_code').trim().notEmpty().withMessage('Batch code is required')
    .isAlphanumeric().withMessage('Batch code must be alphanumeric')
    .isLength({ min: 1, max: 10 }).withMessage('Batch code must be 1-10 characters')
    .customSanitizer((v: string) => v.toUpperCase()),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('subcategory').trim().notEmpty().withMessage('Subcategory is required'),
  body('vendor_name').trim().notEmpty().withMessage('Vendor name is required'),
  body('vendor_address').trim().notEmpty().withMessage('Vendor address is required'),
  body('fssai_license').trim().notEmpty().withMessage('FSSAI license is required')
    .matches(/^\d{14}$/).withMessage('FSSAI license must be exactly 14 digits'),
  body('status').optional().isIn(['active', 'inactive']),
];

const updateValidation = [
  body('category').optional().trim().notEmpty(),
  body('subcategory').optional().trim().notEmpty(),
  body('vendor_name').optional().trim().notEmpty(),
  body('vendor_address').optional().trim().notEmpty(),
  body('fssai_license').optional().trim().matches(/^\d{14}$/).withMessage('FSSAI license must be exactly 14 digits'),
  body('status').optional().isIn(['active', 'inactive']),
];

function validate(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return true; }
  return false;
}

router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const db = getDb();
    const all = [...db.data.products].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit);
    res.json({ success: true, data: { data, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.get('/search', [query('q').trim()], (req: Request, res: Response, next: NextFunction): void => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase();
    const db = getDb();
    const data = db.data.products.filter(p =>
      p.vendor_name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.batch_code.toLowerCase().includes(q)
    ).slice(0, 50);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:id', [param('id').isInt()], (req: Request, res: Response, next: NextFunction): void => {
  try {
    const db = getDb();
    const product = db.data.products.find(p => p.id === parseInt(req.params.id));
    if (!product) throw new NotFoundError('Product not found');
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.post('/', productValidation, (req: Request, res: Response, next: NextFunction): void => {
  if (validate(req, res)) return;
  try {
    const dto = req.body as CreateProductDto;
    const db = getDb();
    if (db.data.products.find(p => p.batch_code.toUpperCase() === dto.batch_code.toUpperCase())) {
      res.status(409).json({ success: false, error: 'A record with this batch code already exists.' });
      return;
    }
    const now = new Date().toISOString();
    const product: RpetProduct = { ...dto, id: db.data.nextId++, status: dto.status || 'active', created_at: now, updated_at: now };
    db.data.products.push(product);
    db.write();
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (err) { next(err); }
});

router.put('/:id', [param('id').isInt(), ...updateValidation], (req: Request, res: Response, next: NextFunction): void => {
  if (validate(req, res)) return;
  try {
    const db = getDb();
    const idx = db.data.products.findIndex(p => p.id === parseInt(req.params.id));
    if (idx === -1) throw new NotFoundError('Product not found');
    const { batch_code: _bc, ...safeUpdate } = req.body as UpdateProductDto & { batch_code?: string };
    db.data.products[idx] = { ...db.data.products[idx], ...safeUpdate, updated_at: new Date().toISOString() };
    db.write();
    res.json({ success: true, data: db.data.products[idx], message: 'Product updated successfully' });
  } catch (err) { next(err); }
});

router.delete('/:id', [param('id').isInt()], (req: Request, res: Response, next: NextFunction): void => {
  try {
    const db = getDb();
    const idx = db.data.products.findIndex(p => p.id === parseInt(req.params.id));
    if (idx === -1) throw new NotFoundError('Product not found');
    db.data.products[idx].status = 'inactive';
    db.data.products[idx].updated_at = new Date().toISOString();
    db.write();
    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (err) { next(err); }
});

export default router;
