import express from 'express';
import { getAllCategory, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryContoller.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCategory);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize(['admin']), createCategory);
router.put('/:id', authenticate, authorize(['admin']), updateCategory);
router.delete('/:id', authenticate, authorize(['admin']), deleteCategory);

export default router;
