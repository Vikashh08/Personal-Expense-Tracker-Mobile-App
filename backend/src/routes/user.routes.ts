import { Router } from 'express';
import { updateOnboardingPreferences } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.put('/onboarding', protect, updateOnboardingPreferences);

export default router;
