/**
 * routes/index.ts
 * -----------------------------------------------------
 * Master router that mounts all feature routes.
 * Keeps API modular and clean.
 */

import { Router } from "express";

// Import individual module routes
import authRoutes from "../Modules/Auth/routes";
import uploadRoutes from "../../src/Constants/uploads";
import slotsRoutes from "../Modules/Slots/routes";
import bookingRoutes from "../Modules/Booking/routes";
import analyticsRoutes from "../Modules/Admin/Dashboard/routes.ts";
import adminUserRoutes from "../Modules/Admin/userManagement/routes.ts";
import teacherRoutes from "../Modules/Teacher/routes.ts"
import eventRoutes from "../Modules/Events/routes.ts";

const router = Router();

/**
 * Mount feature routes
 */
router.use(authRoutes.path, authRoutes.router);
router.use(uploadRoutes.path, uploadRoutes.router);
router.use(slotsRoutes.path, slotsRoutes.router);
router.use(bookingRoutes.path, bookingRoutes.router);
router.use(analyticsRoutes.path, analyticsRoutes.router);
router.use(adminUserRoutes.path, adminUserRoutes.router);
router.use(teacherRoutes.path, teacherRoutes.router);
router.use(eventRoutes.path, eventRoutes.router)

export default router;
