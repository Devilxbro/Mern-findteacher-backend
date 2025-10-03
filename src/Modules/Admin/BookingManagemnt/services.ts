/**
 * services/SessionService.ts
 * =====================================================
 * Complete Session/Booking Management Service
 * Handles all booking operations, analytics, and maintenance
 */

import { BookingModel } from "../../../Db/entities/Bookings";
import { SlotModel } from "../../../Db/entities/Slots";
import { Types } from "mongoose";
// import { SessionFilters } from "../BookingManagemnt/types.ts"


export class SessionService {
  private static instance: SessionService;

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * List sessions with advanced filtering
   * Supports filtering by teacher, student, date range, and status
   */
  async listSessions(filters: SessionFilters) {
    const query: any = {};

    // User-based filtering
    if (filters.teacherId) {
      query.teacherId = new Types.ObjectId(filters.teacherId);
    }
    if (filters.studentId) {
      query.studentId = new Types.ObjectId(filters.studentId);
    }
    if (filters.status) {
      query.status = filters.status;
    }

    // Date filtering with multiple strategies
    if (filters.date) {
      // Single date - get all sessions on that day
      const start = new Date(filters.date);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      query.startTime = { $gte: start, $lte: end };
    } else if (filters.startDate || filters.endDate) {
      // Date range filtering
      query.startTime = {};
      if (filters.startDate) {
        query.startTime.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.startTime.$lte = endDate;
      }
    }

    const sessions = await BookingModel.find(query)
        .populate("teacherId", "fullName email profileImage")
        .populate("studentId", "fullName email profileImage")
        .populate("slotId")
        .sort({ startTime: -1 })
        .lean();

    // Detect missing slot documents for debugging
    const missingSlotsInfo = sessions
        .filter(s => s.slotId && typeof s.slotId === 'object' && '_id' in s.slotId === false)
        .map(s => ({
          bookingId: s._id,
          slotIdRef: (s.slotId as any)?._id || s.slotId
        }));

    if (missingSlotsInfo.length > 0) {
      console.warn('⚠️ Missing slot documents for bookings:', missingSlotsInfo);
    }

    // Enhance sessions with computed fields
    return sessions.map(session => ({
      ...session,
      slotId: session.slotId || null,
      slotMissing: session.slotId === null && (session as any).slotId !== undefined,
      duration: session.endTime && session.startTime
          ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
          : null
    }));
  }

  /**
   * Get booking history (completed and cancelled sessions)
   * Useful for viewing past activity
   */
  async getBookingHistory(filters: HistoryFilters) {
    const query: any = {
      status: { $in: ["completed", "cancelled"] }
    };

    if (filters.teacherId) {
      query.teacherId = new Types.ObjectId(filters.teacherId);
    }
    if (filters.studentId) {
      query.studentId = new Types.ObjectId(filters.studentId);
    }

    const limit = filters.limit ? parseInt(filters.limit.toString()) : 50;

    const history = await BookingModel.find(query)
        .populate("teacherId", "fullName email profileImage")
        .populate("studentId", "fullName email profileImage")
        .populate("slotId")
        .sort({ endTime: -1 })
        .limit(limit)
        .lean();

    return history.map(booking => ({
      ...booking,
      slotId: booking.slotId || null,
      duration: booking.endTime && booking.startTime
          ? Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000)
          : null
    }));
  }

  /**
   * Get upcoming sessions
   * Returns future sessions that are booked, accepted, or pending
   */
  async getUpcomingSessions(filters: UpcomingFilters) {
    const query: any = {
      startTime: { $gte: new Date() },
      status: { $in: ["booked", "accepted", "pending"] }
    };

    if (filters.teacherId) {
      query.teacherId = new Types.ObjectId(filters.teacherId);
    }
    if (filters.studentId) {
      query.studentId = new Types.ObjectId(filters.studentId);
    }

    const limit = filters.limit ? parseInt(filters.limit.toString()) : 20;

    const sessions = await BookingModel.find(query)
        .populate("teacherId", "fullName email profileImage")
        .populate("studentId", "fullName email profileImage")
        .populate("slotId")
        .sort({ startTime: 1 })
        .limit(limit)
        .lean();

    return sessions.map(session => ({
      ...session,
      slotId: session.slotId || null,
      duration: session.endTime && session.startTime
          ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
          : null,
      timeUntilStart: Math.round((new Date(session.startTime).getTime() - Date.now()) / 60000)
    }));
  }

  /**
   * Get session by ID with full details
   */
  async getSessionById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid session ID");
    }

    const session = await BookingModel.findById(id)
        .populate("teacherId", "fullName email profileImage")
        .populate("studentId", "fullName email profileImage")
        .populate("slotId")
        .lean();

    if (!session) {
      throw new Error("Session not found");
    }

    return {
      ...session,
      slotId: session.slotId || null,
      slotMissing: session.slotId === null,
      duration: session.endTime && session.startTime
          ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
          : null
    };
  }

  /**
   * Cancel a session with validation
   * Prevents cancelling past or already completed sessions
   */
  async cancelSession(id: string, reason?: string, cancelledBy?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid session ID");
    }

    const session = await BookingModel.findById(id);
    if (!session) {
      throw new Error("Session not found");
    }

    // Validation checks
    if (session.status === "cancelled") {
      throw new Error("Session is already cancelled");
    }

    if (session.status === "completed") {
      throw new Error("Cannot cancel a completed session");
    }

    // Check if session is in the past
    if (new Date(session.startTime) < new Date()) {
      throw new Error("Cannot cancel a session that has already started");
    }

    // Update session status
    session.status = "cancelled";
    session.cancelReason = reason || "Cancelled by admin";
    session.cancelledAt = new Date();

    if (cancelledBy) {
      (session as any).cancelledBy = cancelledBy;
    }

    await session.save();

    return {
      message: "Session cancelled successfully",
      session: {
        id: session._id,
        status: session.status,
        cancelReason: session.cancelReason,
        cancelledAt: session.cancelledAt
      }
    };
  }

  /**
   * Get comprehensive analytics
   * Supports date range filtering for trend analysis
   */
  async getAnalytics(filters?: AnalyticsFilters) {
    const dateQuery: any = {};

    // Apply date range filter if provided
    if (filters?.startDate || filters?.endDate) {
      dateQuery.createdAt = {};
      if (filters.startDate) {
        dateQuery.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateQuery.createdAt.$lte = endDate;
      }
    }

    // Get counts by status
    const total = await BookingModel.countDocuments(dateQuery);
    const cancelled = await BookingModel.countDocuments({ ...dateQuery, status: "cancelled" });
    const completed = await BookingModel.countDocuments({ ...dateQuery, status: "completed" });
    const booked = await BookingModel.countDocuments({ ...dateQuery, status: "booked" });
    const pending = await BookingModel.countDocuments({ ...dateQuery, status: "pending" });
    const accepted = await BookingModel.countDocuments({ ...dateQuery, status: "accepted" });
    const rejected = await BookingModel.countDocuments({ ...dateQuery, status: "rejected" });

    // Slot integrity check
    const allBookings = await BookingModel.find({
      ...dateQuery,
      slotId: { $ne: null }
    }).select('slotId').lean();

    const slotIds = allBookings.map(b => b.slotId);
    const existingSlots = await SlotModel.find({ _id: { $in: slotIds } }).select('_id').lean();
    const existingSlotIds = new Set(existingSlots.map(s => s._id.toString()));
    const orphanedCount = slotIds.filter(id => !existingSlotIds.has(id?.toString() || '')).length;

    // Revenue analytics (only completed sessions)
    const revenueData = await BookingModel.aggregate([
      { $match: { ...dateQuery, status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          averagePrice: { $avg: "$price" }
        }
      }
    ]);

    return {
      total,
      byStatus: {
        cancelled,
        completed,
        booked,
        pending,
        accepted,
        rejected
      },
      slotInfo: {
        withSlotReference: allBookings.length,
        withoutSlotReference: total - allBookings.length,
        orphanedSlots: orphanedCount,
        validSlots: allBookings.length - orphanedCount
      },
      metrics: {
        cancellationRate: total ? ((cancelled / total) * 100).toFixed(2) : "0.00",
        completionRate: total ? ((completed / total) * 100).toFixed(2) : "0.00",
        acceptanceRate: total ? (((accepted + booked) / total) * 100).toFixed(2) : "0.00"
      },
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        average: revenueData[0]?.averagePrice || 0
      }
    };
  }

  /**
   * Get sessions filtered by specific status
   */
  async getSessionsByStatus(status: string) {
    const validStatuses = ["pending", "accepted", "rejected", "booked", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    return BookingModel.find({ status })
        .populate("teacherId", "fullName email profileImage")
        .populate("studentId", "fullName email profileImage")
        .populate("slotId")
        .sort({ createdAt: -1 })
        .lean();
  }

  /**
   * Check if a slot is available for booking
   */
  async checkSlotAvailability(slotId: string) {
    if (!Types.ObjectId.isValid(slotId)) {
      throw new Error("Invalid slot ID");
    }

    // First verify slot exists
    const slot = await SlotModel.findById(slotId);
    if (!slot) {
      return {
        available: false,
        reason: "Slot does not exist",
        bookedBy: null
      };
    }

    // Check for existing bookings
    const existingBooking = await BookingModel.findOne({
      slotId: new Types.ObjectId(slotId),
      status: { $in: ["booked", "accepted", "pending"] }
    }).populate("studentId", "fullName email");

    return {
      available: !existingBooking,
      reason: existingBooking ? "Slot already booked" : "Slot available",
      bookedBy: existingBooking ? existingBooking.studentId : null,
      slot: {
        id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime
      }
    };
  }

  /**
   * Find orphaned bookings (maintenance/debugging utility)
   * Identifies bookings that reference non-existent slots
   */
  async findOrphanedBookings() {
    const bookingsWithSlots = await BookingModel.find({
      slotId: { $ne: null }
    }).select('_id slotId startTime endTime status').lean();

    const slotIds = bookingsWithSlots.map(b => b.slotId).filter(Boolean);
    const existingSlots = await SlotModel.find({
      _id: { $in: slotIds }
    }).select('_id').lean();

    const existingSlotIds = new Set(existingSlots.map(s => s._id.toString()));

    const orphaned = bookingsWithSlots.filter(booking =>
        !existingSlotIds.has(booking.slotId?.toString() || '')
    );

    return {
      count: orphaned.length,
      bookings: orphaned.map(b => ({
        bookingId: b._id,
        missingSlotId: b.slotId,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status
      }))
    };
  }
}