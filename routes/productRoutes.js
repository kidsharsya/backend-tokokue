import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize(['admin']), createProduct);
router.put('/:id', authenticate, authorize(['admin']), updateProduct);
router.delete('/:id', authenticate, authorize(['admin']), deleteProduct);

export default router;
