import express from 'express';
import { getImagesByProduct, addProductImage, updateProductImage, deleteProductImage } from '../controllers/productimageController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.get('/product/:productId/images', getImagesByProduct);
router.post('/product/:productId/images', upload.single('image'), authenticate, authorize(['admin']), addProductImage);
router.put('/images/:id', authenticate, authorize(['admin']), updateProductImage);
router.delete('/images/:id', authenticate, authorize(['admin']), deleteProductImage);

export default router;
