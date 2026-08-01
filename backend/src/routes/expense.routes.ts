import { Router } from 'express';
import { addExpense, getExpenses, deleteExpense } from '../controllers/expense.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', protect, addExpense);
router.get('/', protect, getExpenses);
router.delete('/:id', protect, deleteExpense);

export default router;
