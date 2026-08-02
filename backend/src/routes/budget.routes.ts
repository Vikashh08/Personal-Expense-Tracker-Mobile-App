import { Router } from 'express';
import { getBudgets, addBudget, deleteBudget } from '../controllers/budget.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getBudgets);
router.post('/', protect, addBudget);
router.delete('/:id', protect, deleteBudget);

export default router;
