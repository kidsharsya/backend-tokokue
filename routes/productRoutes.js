import express from 'express';
import { createProduct, getProducts, getProductBySlug, updateProduct, deleteProduct, upload } from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', upload.array('images', 5), authenticate, authorize(['admin']), createProduct);
router.put('/:slug', upload.array('images', 5), authenticate, authorize(['admin']), updateProduct);
router.delete('/:slug', authenticate, authorize(['admin']), deleteProduct);

export default router;
