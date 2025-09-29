/**
 * routes/admin.user.routes.ts
 * -----------------------------------------------------
 * Admin → User Management API Routes (v1)
 * Mounted under: /api/v1/admin/users
 */

import { Router } from "express";
import { AdminUserController } from "../userManagement/controller.ts";
import { authMiddleware } from "../../../Middleware/Middleware";
import { ROUTES } from "../../../Constants/constants";

const router = Router();
const controller = AdminUserController.getInstance();

/**
 * Admin → User Management Routes
 */
router.get(ROUTES.ADMIN_USER_MANAGEMENT.LIST, authMiddleware, controller.listUsers.bind(controller));
router.get(ROUTES.ADMIN_USER_MANAGEMENT.DETAIL, authMiddleware, controller.getUser.bind(controller));
router.put(ROUTES.ADMIN_USER_MANAGEMENT.STATUS, authMiddleware, controller.updateStatus.bind(controller));
router.delete(ROUTES.ADMIN_USER_MANAGEMENT.DELETE, authMiddleware, controller.deleteUser.bind(controller));
router.get(ROUTES.ADMIN_USER_MANAGEMENT.BOOKINGS, authMiddleware, controller.getBookings.bind(controller));
router.get(ROUTES.ADMIN_USER_MANAGEMENT.PAYMENTS, authMiddleware, controller.getPayments.bind(controller));
router.get(ROUTES.ADMIN_USER_MANAGEMENT.ACTIVE, authMiddleware, controller.getActive.bind(controller));
router.get(ROUTES.ADMIN_USER_MANAGEMENT.FEEDBACK, authMiddleware, controller.getFeedback.bind(controller));
router.get(ROUTES.ADMIN_USER_MANAGEMENT.EXPORT, authMiddleware, controller.exportData.bind(controller));

export default { path: ROUTES.ADMIN_USER_MANAGEMENT.ROOT, router };
