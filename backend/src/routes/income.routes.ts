import { Router } from 'express';
import { addIncome, getIncomes, deleteIncome } from '../controllers/income.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', protect, addIncome);
router.get('/', protect, getIncomes);
router.delete('/:id', protect, deleteIncome);

export default router;
