/**
 * routes/session.routes.ts
 * -----------------------------------------------------
 * Admin Session API routes (v1)
 * Mounted under: /api/v1/admin/sessions
 */

import { Router } from "express";
import { SessionController } from "../BookingManagemnt/controlller.ts";
import { ROUTES } from "../../../Constants/constants.ts";

const router = Router();
const controller = SessionController; // static methods

/**
 * Admin Session Routes
 */
router.get(ROUTES.ADMIN_SESSIONS.LIST, controller.list.bind(controller)); // List sessions
router.get(ROUTES.ADMIN_SESSIONS.DETAIL, controller.getById.bind(controller)); // Get session by ID
router.put(ROUTES.ADMIN_SESSIONS.CANCEL, controller.cancel.bind(controller)); // Cancel session
router.get(ROUTES.ADMIN_SESSIONS.ANALYTICS, controller.analytics.bind(controller)); // Session analytics

export default { path: ROUTES.ADMIN_SESSIONS.ROOT, router };
