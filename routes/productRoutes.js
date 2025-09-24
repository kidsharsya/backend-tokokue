import express from 'express';
import { getAllProducts, getProductBySlug, createProductWithImages, updateProductWithImages, deleteProduct } from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);
router.post('/', upload.array('images', 5), authenticate, authorize(['admin']), createProductWithImages);
router.put('/:slug', upload.array('newImages', 5), authenticate, authorize(['admin']), updateProductWithImages);
router.delete('/:slug', authenticate, authorize(['admin']), deleteProduct);

export default router;
