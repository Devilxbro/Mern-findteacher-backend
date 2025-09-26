/**
 * routes/analytics.routes.ts
 * -----------------------------------------------------
 * Admin Analytics API routes (v1)
 * Mounted under: /api/v1/admin/analytics
 */

import { Router } from 'express';
import { AnalyticsController } from '../Dashboard/controller.ts';
// import { isAdmin } from '../middlewares/auth.middleware';
import { ROUTES } from '../../../Constants/constants.ts';

const router = Router();
const controller = AnalyticsController.getInstance();

/**
 * Admin Analytics Routes
 */
router.get(ROUTES.ANALYTICS.OVERVIEW, controller.getOverview.bind(controller));
router.get(ROUTES.ANALYTICS.USER_GROWTH,  controller.getUserGrowth.bind(controller));
router.get(ROUTES.ANALYTICS.TEACHER_PERFORMANCE,  controller.getTeacherPerformance.bind(controller));
router.get(ROUTES.ANALYTICS.SUBSCRIPTION_STATS,  controller.getSubscriptionStats.bind(controller));
router.get(ROUTES.ANALYTICS.BOOKINGS, controller.getBookingsOverview.bind(controller));

export default { path: ROUTES.ANALYTICS.ROOT, router };
