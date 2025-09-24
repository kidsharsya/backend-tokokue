import express from 'express';
import { getAllCategory, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from '../controllers/categoryContoller.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCategory);
router.get('/:slug', getCategoryBySlug);
router.post('/', authenticate, authorize(['admin']), createCategory);
router.put('/:slug', authenticate, authorize(['admin']), updateCategory);
router.delete('/:slug', authenticate, authorize(['admin']), deleteCategory);

export default router;
