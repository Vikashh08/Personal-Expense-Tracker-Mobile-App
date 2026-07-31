import { Router } from 'express';
import { getAccounts } from '../controllers/account.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getAccounts);

export default router;
