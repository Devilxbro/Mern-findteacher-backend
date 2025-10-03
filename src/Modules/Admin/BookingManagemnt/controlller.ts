/**
 * controllers/SessionController.ts
 * =====================================================
 * Complete Session/Booking Management Controller
 * Handles all HTTP requests for booking operations
 */

import { Request, Response, NextFunction } from "express";
import { SessionService } from "../BookingManagemnt/services";
import { ApiError } from "../../../Utls/ApiError";

const sessionService = SessionService.getInstance();

export class SessionController {
  /**
   * List all sessions with advanced filtering
   * GET /api/v1/admin/sessions
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await sessionService.listSessions({
        teacherId: req.query.teacherId as string,
        studentId: req.query.studentId as string,
        date: req.query.date as string,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      res.json({
        success: true,
        data: sessions,
        count: sessions.length,
        filters: {
          teacherId: req.query.teacherId || null,
          studentId: req.query.studentId || null,
          date: req.query.date || null,
          status: req.query.status || null,
          startDate: req.query.startDate || null,
          endDate: req.query.endDate || null
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(400, error.message));
      } else {
        next(new ApiError(400, "Unknown error occurred"));
      }
    }
  }

  /**
   * Get booking history
   * GET /api/v1/admin/sessions/history
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await sessionService.getBookingHistory({
        teacherId: req.query.teacherId as string,
        studentId: req.query.studentId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });

      res.json({
        success: true,
        data: history,
        count: history.length,
        message: "Booking history retrieved successfully"
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(400, error.message));
      } else {
        next(new ApiError(400, "Unknown error occurred"));
      }
    }
  }

  /**
   * Get upcoming sessions
   * GET /api/v1/admin/sessions/upcoming
   */
  static async getUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const upcoming = await sessionService.getUpcomingSessions({
        teacherId: req.query.teacherId as string,
        studentId: req.query.studentId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });

      res.json({
        success: true,
        data: upcoming,
        count: upcoming.length,
        message: "Upcoming sessions retrieved successfully"
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(400, error.message));
      } else {
        next(new ApiError(400, "Unknown error occurred"));
      }
    }
  }

  /**
   * Get session by ID
   * GET /api/v1/admin/sessions/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await sessionService.getSessionById(req.params.id);
      res.json({
        success: true,
        data: session,
        message: "Session retrieved successfully"
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(404, error.message));
      } else {
        next(new ApiError(404, "Unknown error occurred"));
      }
    }
  }

  /**
   * Cancel a session
   * PATCH /api/v1/admin/sessions/:id/cancel
   */
  static async cancel(req: Request, res: Response, next: NextFunction) {
      try {
          const { reason, cancelledBy } = req.body;
          const sessionId = req.params.id;

          if (!sessionId) {
              throw new Error("Session ID is required");
          }

          const result = await sessionService.cancelSession(sessionId, reason, cancelledBy);

          res.status(200).json({
              success: true,
              ...result
          });
      } catch (error: unknown) {
          if (error instanceof Error) {
              next(new ApiError(400, error.message));
          } else {
              next(new ApiError(400, "Unknown error occurred"));
          }
      }
  }

  /**
   * Get session analytics
   * GET /api/v1/admin/sessions/analytics
   */
  static async analytics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await sessionService.getAnalytics({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      });

      res.json({
        success: true,
        data: stats,
        message: "Analytics retrieved successfully"
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(500, error.message));
      } else {
        next(new ApiError(500, "Unknown error occurred"));
      }
    }
  }

  /**
   * Get sessions by status
   * GET /api/v1/admin/sessions/status/:status
   */
  static async getByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.params;

      if (!status) {
        throw new Error("Status is required");
      }

      const sessions = await sessionService.getSessionsByStatus(status);

      res.json({
        success: true,
        data: sessions,
        count: sessions.length,
        status
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(400, error.message));
      } else {
        next(new ApiError(400, "Unknown error occurred"));
      }
    }
  }

  /**
   * Check slot availability
   * GET /api/v1/admin/sessions/slots/:slotId/availability
   */
  static async checkSlotAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { slotId } = req.params;

      if (!slotId) {
        throw new Error("Slot ID is required");
      }

      const availability = await sessionService.checkSlotAvailability(slotId);

      res.json({
        success: true,
        data: availability
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(400, error.message));
      } else {
        next(new ApiError(400, "Unknown error occurred"));
      }
    }
  }

  /**
   * Find orphaned bookings
   * GET /api/v1/admin/sessions/maintenance/orphaned
   */
  static async findOrphaned(_req: Request, res: Response, next: NextFunction) {
    try {
      const orphaned = await sessionService.findOrphanedBookings();

      res.json({
        success: true,
        data: orphaned,
        message: orphaned.count > 0
            ? `Found ${orphaned.count} orphaned booking(s)`
            : "No orphaned bookings found"
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ApiError(500, error.message));
      } else {
        next(new ApiError(500, "Unknown error occurred"));
      }
    }
  }
}