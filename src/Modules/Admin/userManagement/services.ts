import { UserModel } from "../../../Db/entities/User";
import { BookingModel } from "../../../Db/entities/Bookings";
import { PaymentModel } from "../../../Db/entities/Payments";
import { Types } from "mongoose";
import debug from "debug";

const log = debug("app:admin-user-service");

export class AdminUserService {
  private static instance: AdminUserService;

  private constructor() {}

  public static getInstance(): AdminUserService {
    if (!AdminUserService.instance) {
      AdminUserService.instance = new AdminUserService();
    }
    return AdminUserService.instance;
  }

  async listUsers(query: any) {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.q) {
      filter.$or = [
        { fullName: new RegExp(query.q, "i") },
        { email: new RegExp(query.q, "i") },
      ];
    }
    if (query.role) filter.role = query.role;

    log("listUsers called with filter:", filter, "page:", page, "limit:", limit);

    const [users, total] = await Promise.all([
      UserModel.find(filter).select("-password").skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ]);

    log("listUsers result count:", users.length, "total:", total);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUserById(id: string) {
    log("getUserById called with id:", id);
    this.ensureValidId(id);

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      log("getUserById not found:", id);
      throw new Error("User not found");
    }

    log("getUserById result:", user.fullName);
    return user;
  }

  async updateStatus(id: string, isActive: boolean) {
    log("updateStatus called with id:", id, "isActive:", isActive);
    this.ensureValidId(id);

    const user = await UserModel.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!user) {
      log("updateStatus user not found:", id);
      throw new Error("User not found");
    }

    log("updateStatus updated user:", user.fullName, "isActive:", user.isActive);
    return user;
  }

  async deleteUser(id: string) {
    log("deleteUser called with id:", id);
    this.ensureValidId(id);

    const deleted = await UserModel.findByIdAndDelete(id);
    if (!deleted) {
      log("deleteUser not found:", id);
      throw new Error("User not found");
    }

    log("deleteUser success:", deleted.fullName);
    return true;
  }

  async getUserBookings(id: string) {
    log("getUserBookings called with id:", id);
    this.ensureValidId(id);

    const bookings = await BookingModel.find({ userId: id }).populate("teacherId", "fullName email");
    log("getUserBookings found:", bookings.length, "bookings");
    return bookings;
  }

  async getUserPayments(id: string) {
    log("getUserPayments called with id:", id);
    this.ensureValidId(id);

    const payments = await PaymentModel.find({ userId: id }).lean();
    log("getUserPayments found:", payments.length, "payments");
    return payments;
  }

  async getActiveUsers() {
    log("getActiveUsers called");
    const users = await UserModel.find({ isActive: true }).select("fullName email role createdAt");
    log("getActiveUsers found:", users.length, "active users");
    return users;
  }

  async getUserFeedback() {
    log("getUserFeedback called");
    const feedbacks = await BookingModel.find({ feedback: { $exists: true } })
      .populate("userId", "fullName email")
      .populate("teacherId", "fullName email");
    log("getUserFeedback found:", feedbacks.length, "feedback entries");
    return feedbacks;
  }

  async exportUserData() {
    log("exportUserData called");
    const users = await UserModel.find().lean();
    log("exportUserData total users:", users.length);

    return users.map((u) => ({
      Name: u.fullName,
      Email: u.email,
      Role: u.role,
      Active: u.isActive,
      CreatedAt: u.createdAt,
    }));
  }

  private ensureValidId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      log("Invalid MongoDB ID detected:", id);
      throw new Error("Invalid MongoDB ID");
    }
  }
}
