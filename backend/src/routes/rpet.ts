import { Router, Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { getDb } from '../database';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/lookup',
  [query('code').trim().notEmpty().withMessage('Code is required').isAlphanumeric().withMessage('Code must be alphanumeric')],
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, error: errors.array()[0].msg });
        return;
      }
      const code = (req.query.code as string).toUpperCase();
      const db = getDb();
      const declaration = db.data.declarations.find(d => d.combined_code.toUpperCase() === code && d.status === 'active');
      if (!declaration) throw new NotFoundError('No declaration found for this code. Please check the code printed on the bottle and try again.');
      res.json({ success: true, data: declaration });
    } catch (err) { next(err); }
  }
);

export default router;
