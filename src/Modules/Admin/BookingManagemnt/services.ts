import { BookingModel } from "../../../Db/entities/Bookings";
import { Types } from "mongoose";

export class SessionService {
  private static instance: SessionService;
  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  async listSessions(filters: { teacherId?: string; studentId?: string; date?: string }) {
    const query: any = {};

    if (filters.teacherId) query.teacherId = new Types.ObjectId(filters.teacherId);
    if (filters.studentId) query.studentId = new Types.ObjectId(filters.studentId);

    if (filters.date) {
      const start = new Date(filters.date);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      query.startTime = { $gte: start, $lte: end };
    }

    return BookingModel.find(query)
      .populate("teacherId", "fullName email")
      .populate("studentId", "fullName email")
      .populate("slotId")
      .sort({ startTime: -1 })
      .lean();
  }

  async getSessionById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid session ID");

    const session = await BookingModel.findById(id)
      .populate("teacherId", "fullName email")
      .populate("studentId", "fullName email")
      .populate("slotId")
      .lean();

    if (!session) throw new Error("Session not found");
    return session;
  }

  async cancelSession(id: string, reason?: string) {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid session ID");

    const session = await BookingModel.findById(id);
    if (!session) throw new Error("Session not found");

    session.status = "cancelled";
    session.cancelReason = reason || "Cancelled by admin";
    session.cancelledAt = new Date();
    await session.save();

    return { message: "Session cancelled successfully", session };
  }

  async getAnalytics() {
    const total = await BookingModel.countDocuments();
    const cancelled = await BookingModel.countDocuments({ status: "cancelled" });
    const completed = await BookingModel.countDocuments({ status: "completed" });
    const booked = await BookingModel.countDocuments({ status: "booked" });

    return {
      total,
      cancelled,
      completed,
      booked,
      cancellationRate: total ? (cancelled / total) * 100 : 0,
    };
  }
}
