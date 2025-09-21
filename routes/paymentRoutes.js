import express from 'express';
import { createPayment, getAllPayments, getPaymentById } from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, createPayment);
router.get('/', authenticate, authorize(['admin']), getAllPayments);
router.get('/:id', authenticate, getPaymentById);

export default router;
