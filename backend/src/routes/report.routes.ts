import { Router } from 'express';
import { exportTransactionsCSV } from '../controllers/report.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/export', protect, exportTransactionsCSV);

export default router;
