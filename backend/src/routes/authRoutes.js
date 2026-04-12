import { Router } from 'express';
import {
  changePassword,
  completeRegistration,
  disableTwoFactor,
  enableTwoFactor,
  getSecurityStatus,
  identifyClientForRegistration,
  listActiveSessions,
  login,
  loginWithTwoFactor,
  logout,
  revokeSession,
  sendRegistrationCode,
  setupTwoFactor,
  validateSession,
  verifyRegistrationCode,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register/identify', identifyClientForRegistration);
router.post('/register/send-code', sendRegistrationCode);
router.post('/register/verify-code', verifyRegistrationCode);
router.post('/register/complete', completeRegistration);
router.post('/login', login);
router.post('/login/2fa', loginWithTwoFactor);
router.get('/validate', authMiddleware, validateSession);
router.get('/security', authMiddleware, getSecurityStatus);
router.post('/2fa/setup', authMiddleware, setupTwoFactor);
router.post('/2fa/enable', authMiddleware, enableTwoFactor);
router.post('/2fa/disable', authMiddleware, disableTwoFactor);
router.get('/sessions', authMiddleware, listActiveSessions);
router.delete('/sessions/:sessionId', authMiddleware, revokeSession);
router.post('/change-password', authMiddleware, changePassword);
router.post('/logout', authMiddleware, logout);

export default router;
