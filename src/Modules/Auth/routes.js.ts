import { Router } from 'express';
import { AuthController } from '../Auth/controller.ts';
import { ROUTES } from '../../Constants/constants.ts';
import { authMiddleware, roleMiddleware } from '../../Middleware/Middleware.ts';

const router = Router();

/**
 * Auth Routes
 * Mounted under: /api/v1/auth
 */
router.post(ROUTES.AUTH.SIGNUP, AuthController.signup);
router.post(ROUTES.AUTH.LOGIN, AuthController.login);
router.post(ROUTES.AUTH.FORGOT_PASSWORD, AuthController.forgotPassword);
router.post(ROUTES.AUTH.RESET_PASSWORD, AuthController.resetPassword);
router.get(
  ROUTES.AUTH.LISTING_PARAMS,
  authMiddleware,
  roleMiddleware(['admin']),
  AuthController.getAllUsers,
);

router.get(
  ROUTES.AUTH.DETAIL_PARAMS,
  authMiddleware,
  AuthController.getSpecificUser,
);

router.post(
    ROUTES.AUTH.GOOGLE_PARAMS,
    AuthController.googleAuth,
)
// router.post(ROUTES.AUTH.LOGOUT, AuthController.logout);
// router.post(ROUTES.AUTH.REFRESH_TOKEN, AuthController.refreshToken);

export default { path: ROUTES.AUTH.ROOT, router };
