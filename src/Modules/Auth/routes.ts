    import { Router } from 'express';
    import { AuthController } from '../Auth/controller.ts';
    import { ROUTES } from '../../Constants/constants.ts';
    import { qualificationFields } from "../../Constants/misc.ts";

    import { authMiddleware, roleMiddleware, smartBodyParser } from '../../Middleware/Middleware.ts';

    const router = Router();

    /**
     * Auth Routes
     * Mounted under: /api/v1/auth
     */
    router.post(ROUTES.AUTH.SIGNUP, qualificationFields,AuthController.signup);
    router.post(ROUTES.AUTH.LOGIN, smartBodyParser ,AuthController.login);
    router.post(ROUTES.AUTH.FORGOT_PASSWORD, smartBodyParser,AuthController.forgotPassword);
    router.post(ROUTES.AUTH.RESET_PASSWORD, smartBodyParser,AuthController.resetPassword);
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
    );

    router.put(
      ROUTES.AUTH.EDITOR,
      authMiddleware,
      smartBodyParser,
      AuthController.editProfile,
    )
    router.delete(
        ROUTES.AUTH.DELETE_PARAMS,
        authMiddleware,
        AuthController.deleteProfile,
    )
    // router.post(ROUTES.AUTH.LOGOUT, AuthController.logout);
    // router.post(ROUTES.AUTH.REFRESH_TOKEN, AuthController.refreshToken);

    export default { path: ROUTES.AUTH.ROOT, router };
