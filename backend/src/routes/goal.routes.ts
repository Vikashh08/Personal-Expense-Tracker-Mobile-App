import { Router } from 'express';
import { getGoals, addGoal, addContribution, deleteGoal } from '../controllers/goal.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getGoals);
router.post('/', protect, addGoal);
router.post('/:id/contribute', protect, addContribution);
router.delete('/:id', protect, deleteGoal);

export default router;
