import { Router } from 'express';
import { getMyAccount } from '../controllers/accountController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', authMiddleware, getMyAccount);

export default router;
