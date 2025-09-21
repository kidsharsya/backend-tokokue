import express from 'express';
import { getImagesByProduct, addProductImage, updateProductImage, deleteProductImage } from '../controllers/productimageController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getImagesByProduct);
router.post('/', authenticate, authorize(['admin']), addProductImage);
router.put('/:id', authenticate, authorize(['admin']), updateProductImage);
router.delete('/:id', authenticate, authorize(['admin']), deleteProductImage);

export default router;
