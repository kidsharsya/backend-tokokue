import express from 'express';
import { getRoles, createRole } from '../controllers/roleController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), getRoles);
router.post('/', authenticate, authorize(['admin']), createRole);

export default router;
