/**
 * routes/session.routes.ts
 * =====================================================
 * Complete Admin Session API Routes (v1)
 * Mounted under: /api/v1/admin/sessions
 */

import { Router } from "express";
import { SessionController } from "../BookingManagemnt/controlller";
import { ROUTES } from "../../../Constants/constants";

const router = Router();

// =====================================================
// SESSION LISTING & FILTERING ROUTES
// =====================================================

/**
 * GET /api/v1/admin/sessions
 * List all sessions with advanced filtering
 */
router.get(
    ROUTES.ADMIN_SESSIONS.LIST,
    SessionController.list.bind(SessionController)
);

/**
 * GET /api/v1/admin/sessions/analytics
 * Get session analytics with optional date filtering
 */
router.get(
    ROUTES.ADMIN_SESSIONS.ANALYTICS,
    SessionController.analytics.bind(SessionController)
);

/**
 * GET /api/v1/admin/sessions/history
 * Get booking history (completed and cancelled sessions)
 */
router.get(
    ROUTES.ADMIN_SESSIONS.HISTORY,
    SessionController.getHistory.bind(SessionController)
);

/**
 * GET /api/v1/admin/sessions/upcoming
 * Get upcoming sessions (booked, accepted, pending)
 */
router.get(
    ROUTES.ADMIN_SESSIONS.UPCOMING,
    SessionController.getUpcoming.bind(SessionController)
);

/**
 * GET /api/v1/admin/sessions/status/:status
 * Get sessions by specific status
 */
router.get(
    ROUTES.ADMIN_SESSIONS.BY_STATUS,
    SessionController.getByStatus.bind(SessionController)
);

// =====================================================
// SESSION DETAILS & ACTIONS
// =====================================================

/**
 * GET /api/v1/admin/sessions/:id
 * Get session by ID with full details
 */
router.get(
    ROUTES.ADMIN_SESSIONS.DETAIL,
    SessionController.getById.bind(SessionController)
);

/**
 * PATCH /api/v1/admin/sessions/:id/cancel
 * Cancel a session
 */
router.patch(
    ROUTES.ADMIN_SESSIONS.CANCEL,
    SessionController.cancel.bind(SessionController)
);

// =====================================================
// ANALYTICS & UTILITIES
// =====================================================


/**
 * GET /api/v1/admin/sessions/slots/:slotId/availability
 * Check if a specific slot is available
 */
router.get(
    ROUTES.ADMIN_SESSIONS.SLOT_AVAILABILITY,
    SessionController.checkSlotAvailability.bind(SessionController)
);

/**
 * GET /api/v1/admin/sessions/maintenance/orphaned
 * Find orphaned bookings (debugging/maintenance endpoint)
 */
router.get(
    ROUTES.ADMIN_SESSIONS.ORPHANED,
    SessionController.findOrphaned.bind(SessionController)
);

// =====================================================
// EXPORT
// =====================================================
export default {
    path: ROUTES.ADMIN_SESSIONS.ROOT,
    router
};