import { SlotModel } from "../../Db/entities/Slots";
import { BookingModel, IBookingDocument } from "../../Db/entities/Bookings.ts";
import { Types } from "mongoose";
import debug from "debug";

const log = debug("app:booking-service");

export class BookingService {
  private static instance: BookingService;
  private constructor() {}
  static getInstance(): BookingService {
    if (!BookingService.instance) BookingService.instance = new BookingService();
    return BookingService.instance;
  }

  async getAvailableSlots(teacherId?: string, date?: string) {
    log("Fetching available slots", { teacherId, date });

    const query: any = { isActive: true, isBooked: false };
    if (teacherId) query.teacherId = new Types.ObjectId(teacherId);
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.startTime = { $gte: start, $lte: end };
    }

    return await SlotModel.find(query).sort({ startTime: 1 });
  }

  async bookSlot(slotId: string, studentId: string): Promise<IBookingDocument> {
    log("Booking slot", slotId);

    const slot = await SlotModel.findById(slotId);
    if (!slot) throw new Error("Slot not found");
    if (slot.isBooked) throw new Error("Slot already booked");

    slot.isBooked = true;
    await slot.save();

    const booking = await BookingModel.create({
      slotId: slot._id,
      studentId,
      teacherId: slot.teacherId,
    });

    return booking;
  }

  async cancelBooking(bookingId: string, studentId: string) {
    log("Cancelling booking", bookingId);

    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.studentId.toString() !== studentId) {
      throw new Error("Unauthorized: you can cancel only your bookings");
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    await SlotModel.findByIdAndUpdate(booking.slotId, { isBooked: false });

    return { message: "Booking cancelled successfully", booking };
  }

  async getAppointmentHistory(userId: string, status?: string) {
    const query: any = {
      $or: [
        { studentId: new Types.ObjectId(userId) },
        { teacherId: new Types.ObjectId(userId) }
      ]
    };

    if (status) query.status = status;

    return BookingModel.find(query)
      .populate("slotId")
      .populate("studentId", "fullName email")
      .populate("teacherId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();
  }

}
