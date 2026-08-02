import { Router } from 'express';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getCategories);
router.post('/', protect, addCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
