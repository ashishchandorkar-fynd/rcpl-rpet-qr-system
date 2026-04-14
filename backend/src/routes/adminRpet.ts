import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { getDb } from '../database';
import { RpetDeclaration, CreateDeclarationDto, UpdateDeclarationDto } from '../types';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

const declarationValidation = [
  body('combined_code').trim().notEmpty().withMessage('Combined code is required')
    .isAlphanumeric().withMessage('Combined code must be alphanumeric')
    .isLength({ min: 2, max: 20 }).withMessage('Combined code must be 2-20 characters')
    .customSanitizer((v: string) => v.toUpperCase()),
  body('product_name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('manufacturing_location').trim().notEmpty().withMessage('Manufacturing location is required'),
  body('recycle_content')
    .notEmpty().withMessage('Recycle content is required')
    .isFloat({ min: 0, max: 100 }).withMessage('Recycle content must be 0-100'),
  body('pwm_reg_no').trim().notEmpty().withMessage('PWM registration number is required'),
  body('status').optional().isIn(['active', 'inactive']),
];

const updateValidation = [
  body('product_name').optional().trim().notEmpty(),
  body('sku').optional().trim().notEmpty(),
  body('manufacturing_location').optional().trim().notEmpty(),
  body('recycle_content').optional().isFloat({ min: 0, max: 100 }).withMessage('Recycle content must be 0-100'),
  body('pwm_reg_no').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive']),
];

function validate(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return true; }
  return false;
}

// GET list with pagination
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const db = getDb();
    const all = [...db.data.declarations].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit);
    res.json({ success: true, data: { data, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// GET search
router.get('/search', [query('q').trim()], (req: Request, res: Response, next: NextFunction): void => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase();
    const db = getDb();
    const data = db.data.declarations.filter(d =>
      d.combined_code.toLowerCase().includes(q) ||
      d.product_name.toLowerCase().includes(q) ||
      d.sku.toLowerCase().includes(q)
    ).slice(0, 50);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET by id
router.get('/:id', [param('id').isInt()], (req: Request, res: Response, next: NextFunction): void => {
  try {
    const db = getDb();
    const declaration = db.data.declarations.find(d => d.id === parseInt(req.params.id));
    if (!declaration) throw new NotFoundError('Declaration not found');
    res.json({ success: true, data: declaration });
  } catch (err) { next(err); }
});

// POST create
router.post('/', declarationValidation, (req: Request, res: Response, next: NextFunction): void => {
  if (validate(req, res)) return;
  try {
    const dto = req.body as CreateDeclarationDto;
    const db = getDb();
    if (db.data.declarations.find(d => d.combined_code.toUpperCase() === dto.combined_code.toUpperCase())) {
      res.status(409).json({ success: false, error: 'A record with this combined code already exists.' });
      return;
    }
    const now = new Date().toISOString();
    const declaration: RpetDeclaration = {
      ...dto,
      id: db.data.declNextId++,
      recycle_content: Number(dto.recycle_content),
      status: dto.status || 'active',
      created_at: now,
      updated_at: now,
    };
    db.data.declarations.push(declaration);
    db.write();
    res.status(201).json({ success: true, data: declaration, message: 'Declaration created successfully' });
  } catch (err) { next(err); }
});

// PUT update
router.put('/:id', [param('id').isInt(), ...updateValidation], (req: Request, res: Response, next: NextFunction): void => {
  if (validate(req, res)) return;
  try {
    const db = getDb();
    const idx = db.data.declarations.findIndex(d => d.id === parseInt(req.params.id));
    if (idx === -1) throw new NotFoundError('Declaration not found');
    const { combined_code: _cc, ...safeUpdate } = req.body as UpdateDeclarationDto & { combined_code?: string };
    const update = { ...safeUpdate };
    if (update.recycle_content !== undefined) update.recycle_content = Number(update.recycle_content);
    db.data.declarations[idx] = { ...db.data.declarations[idx], ...update, updated_at: new Date().toISOString() };
    db.write();
    res.json({ success: true, data: db.data.declarations[idx], message: 'Declaration updated successfully' });
  } catch (err) { next(err); }
});

// DELETE (soft deactivate)
router.delete('/:id', [param('id').isInt()], (req: Request, res: Response, next: NextFunction): void => {
  try {
    const db = getDb();
    const idx = db.data.declarations.findIndex(d => d.id === parseInt(req.params.id));
    if (idx === -1) throw new NotFoundError('Declaration not found');
    db.data.declarations[idx].status = 'inactive';
    db.data.declarations[idx].updated_at = new Date().toISOString();
    db.write();
    res.json({ success: true, message: 'Declaration deactivated successfully' });
  } catch (err) { next(err); }
});

export default router;
