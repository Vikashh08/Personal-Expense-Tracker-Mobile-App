import { Router } from 'express';
import { getExpenseByCategory, getCashFlow } from '../controllers/analytics.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/expense-by-category', protect, getExpenseByCategory);
router.get('/cash-flow', protect, getCashFlow);

export default router;
