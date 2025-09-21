import express from 'express';
import { getAllOrders, getOrderById, getMyOrders, createOrder, updateOrder, deleteOrder } from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.get('/myorders', authenticate, getMyOrders);

router.post('/', authenticate, createOrder);
router.patch('/:id', authenticate, updateOrder);
router.delete('/:id', authenticate, authorize(['admin']), deleteOrder);

export default router;
