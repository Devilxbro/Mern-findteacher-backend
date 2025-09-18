/**
 * routes/index.routes.ts
 * -----------------------------------------------------
 * Aggregates all route modules and mounts them under
 * their base paths. This allows you to access any
 * API endpoint from one central location.
 */

import { Router } from "express";
// import { ROUTES } from "../Constants/constants.ts";

// Import individual route modules
import authRoutes from "../Modules/Auth/routes.js.ts";
// import userRoutes from "./user.routes";
// import teacherRoutes from "./teacher.routes";
// import adminRoutes from "./admin.routes";
// import businessRoutes from "./business.routes";
// import eventRoutes from "./event.routes";

const router = Router();

// Mount each module under its base path
router.use(authRoutes.path, authRoutes.router);
// router.use(userRoutes.path, userRoutes.router);
// router.use(teacherRoutes.path, teacherRoutes.router);
// router.use(adminRoutes.path, adminRoutes.router);
// router.use(businessRoutes.path, businessRoutes.router);
// router.use(eventRoutes.path, eventRoutes.router);

export default router;
