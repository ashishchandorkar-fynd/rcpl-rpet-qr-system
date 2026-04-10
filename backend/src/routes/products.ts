import { Router, Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { getDb } from '../database';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

router.get('/lookup', [
  query('code').trim().notEmpty().withMessage('Batch code is required')
    .isAlphanumeric().withMessage('Batch code must be alphanumeric only')
    .isLength({ min: 1, max: 10 }).withMessage('Batch code must be 1-10 characters'),
], (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

  try {
    const code = (req.query.code as string).toUpperCase();
    const db = getDb();
    const product = db.data.products.find(p => p.batch_code.toUpperCase() === code);

    if (!product) throw new NotFoundError('No product found for this batch code. Please verify the code on your bottle.');

    if (product.status === 'inactive') {
      res.status(400).json({ success: false, error: 'Product information is not currently available. Please contact RCPL customer support.' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

export default router;
