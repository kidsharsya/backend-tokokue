import express from 'express';
import { registerUser, getUsers, loginUser, updateProfile, updateUserById, deleteUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/', authenticate, authorize(['admin']), getUsers);
router.put('/:id', authenticate, authorize(['admin']), updateUserById);
router.delete('/:id', authenticate, authorize(['admin']), deleteUser);
router.put('/profile', authenticate, updateProfile);

export default router;
