import { Router } from "express";
import { AuthController } from "../Auth/controller.ts";
import { ROUTES } from "../../Constants/constants.ts";

const router = Router();

/**
 * Auth Routes
 * Mounted under: /api/v1/auth
 */
router.post(ROUTES.AUTH.SIGNUP, AuthController.signup);
router.post(ROUTES.AUTH.LOGIN, AuthController.login);
router.post(ROUTES.AUTH.FORGOT_PASSWORD, AuthController.forgotPassword);
router.post(ROUTES.AUTH.RESET_PASSWORD, AuthController.resetPassword);
// router.post(ROUTES.AUTH.LOGOUT, AuthController.logout);
// router.post(ROUTES.AUTH.REFRESH_TOKEN, AuthController.refreshToken);

export default { path: ROUTES.AUTH.ROOT, router };
