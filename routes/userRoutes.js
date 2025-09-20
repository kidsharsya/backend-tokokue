import express from 'express';
import { registerUser, getUsers, loginUser, updateProfile } from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/', authenticate, authorize(['admin']), getUsers);
router.put('/profile', authenticate, updateProfile);

export default router;
