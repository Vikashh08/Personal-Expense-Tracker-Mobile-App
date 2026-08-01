import { Router } from 'express';
import { getAllTransactions } from '../controllers/transaction.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getAllTransactions);

export default router;
