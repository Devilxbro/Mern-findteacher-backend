
import { UserModel } from "../../../Db/entities/User.ts";
import { BookingModel } from "../../../Db/entities/Bookings.ts";

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Overview: total users, teachers, students, sessions, revenue
   */
  async getOverview() {
    const totalUsers = await UserModel.countDocuments();
    const totalTeachers = await UserModel.countDocuments({ role: "teacher" });
    const totalStudents = await UserModel.countDocuments({ role: "student" });
    const totalSessions = await BookingModel.countDocuments();

    const revenueAgg = await BookingModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$pricePaid" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    return {
      success: true,
      data: { totalUsers, totalTeachers, totalStudents, totalSessions, totalRevenue },
    };
  }

  /**
   * User growth by month
   */
  async getUserGrowth() {
    const growth = await UserModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          users: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    return {
      success: true,
      data: growth,
    };
  }

  /**
   * Top performing teachers by bookings and revenue
   */
  async getTeacherPerformance() {
    const performance = await BookingModel.aggregate([
      { $group: { _id: "$teacherId", totalBookings: { $sum: 1 }, revenue: { $sum: "$pricePaid" } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: "$teacher" },
      {
        $project: {
          _id: 0,
          teacherId: "$_id",
          teacherName: "$teacher.fullName",
          totalBookings: 1,
          revenue: 1,
        },
      },
    ]);

    return { success: true, data: performance };
  }

  /**
   * Subscription stats (placeholder, extend with actual SubscriptionModel)
   */
  async getSubscriptionStats() {
    // Replace with actual subscription logic
    return {
      success: true,
      data: {
        totalSubscriptions: 0,
        churnRate: 0,
        retentionRate: 0,
        monthlyRevenue: [],
      },
    };
  }

  /**
   * Daily bookings overview
   */
  async getBookingsOverview() {
    const dailyBookings = await BookingModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    return {
      success: true,
      data: dailyBookings,
    };
  }
}
