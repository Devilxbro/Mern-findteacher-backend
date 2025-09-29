import { Request, Response } from "express";
import { BookingService } from "./services";
import { AvailableSlotsQuerySchema, BookSlotDto } from "./validation";
import { AuthRequest } from "../../Middleware/Middleware";

const bookingService = BookingService.getInstance();

export class BookingController {
  static async getAvailableSlots(req: Request, res: Response) {
    try {
      const { date, teacherId } = AvailableSlotsQuerySchema.parse(req.query);
      const slots = await bookingService.getAvailableSlots(teacherId, date);
      res.status(200).json({ success: true, slots });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async book(req: AuthRequest, res: Response) {
    try {
      const { slotId } = BookSlotDto.parse(req.body);
      const studentId = req.user?.userId;
      const booking = await bookingService.bookSlot(slotId, studentId!);
      res.status(201).json({ success: true, booking });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async cancel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const studentId = req.user?.userId;
      const result = await bookingService.cancelBooking(id, studentId!);
      res.status(200).json({ success: true, result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }


  static async history(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role as "student" | "teacher";
      const status = req.query.status as string | undefined;

      if (!userId || !role) throw new Error("Unauthorized");

      const history = await bookingService.getAppointmentHistory(userId, role, status);
      res.status(200).json({ success: true, history });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
