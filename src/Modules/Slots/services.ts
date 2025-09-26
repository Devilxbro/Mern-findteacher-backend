import { SlotModel, ISlotDocument } from "../../Db/entities/Slots";
import { UserModel } from "../../Db/entities/User";
import { Types } from "mongoose";
import debug from "debug";
import { CreateSlotDto, UpdateSlotDto } from "./types";

const log = debug("app:slot-service");

export class SlotService {
  private static instance: SlotService;

  private constructor() {}

  static getInstance(): SlotService {
    if (!SlotService.instance) {
      SlotService.instance = new SlotService();
    }
    return SlotService.instance;
  }

  /**
   * Normalize date strings into Date object
   * Supports "YYYY-MM-DD" or full Date
   */
  private normalizeDate(date: string | Date): Date {
    if (date instanceof Date) return date;
    return new Date(`${date}T00:00:00.000Z`);
  }

  /**
   * Normalize time relative to a base date.
   * Supports:
   *  - "HH:mm"  (24h)
   *  - "hh:mm A" (12h with AM/PM)
   *  - Full ISO date
   */
  private normalizeTime(date: string | Date, time: string | Date): Date {
    const baseDate = this.normalizeDate(date);
    if (time instanceof Date) return time;

    // 12-hour or 24-hour with AM/PM support
    const timeRegex12 = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const timeRegex24 = /^(\d{2}):(\d{2})$/;

    let hours: number;
    let minutes: number;

    if (timeRegex12.test(time)) {
      const [, h, m, meridian] = time.match(timeRegex12)!;
      hours = parseInt(h, 10);
      minutes = parseInt(m, 10);
      if (meridian.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
    } else if (timeRegex24.test(time)) {
      const [, h, m] = time.match(timeRegex24)!;
      hours = parseInt(h, 10);
      minutes = parseInt(m, 10);
    } else {
      // fallback: try parsing as full date
      return new Date(time);
    }

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }


  /**
   * Create a new slot
   */
  async createSlot(data: CreateSlotDto): Promise<ISlotDocument> {
    log("Creating slot:", data);

    // 1️⃣ Validate teacher
    const teacher = await UserModel.findById(data.teacherId);
    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Invalid teacherId. Must belong to a teacher.");
    }

    if (!data.date || !data.startTime || !data.endTime) {
      throw new Error("`date`, `startTime`, and `endTime` are required.");
    }

    // 2️⃣ Normalize date and times
    const baseDate = data.date instanceof Date ? data.date : data.date;
    const startTime = this.normalizeTime(baseDate, data.startTime);
    let endTime = this.normalizeTime(baseDate, data.endTime);

    // 3️⃣ Handle overnight slots
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // 4️⃣ Numeric fields
    const durationMinutes = Number(data.durationMinutes) || Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    const price = data.price !== undefined ? Number(data.price) : 0;
    const capacity = data.capacity !== undefined ? Number(data.capacity) : 1;

    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      throw new Error("durationMinutes must be a positive number.");
    }

    // 5️⃣ Overlap check
    const overlap = await SlotModel.findOne({
      teacherId: new Types.ObjectId(data.teacherId),
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });
    if (overlap) throw new Error("Slot overlaps with an existing slot.");

    // 6️⃣ Create slot
    const slot = await SlotModel.create({
      teacherId: data.teacherId,
      date: this.normalizeDate(baseDate),
      startTime,
      endTime,
      durationMinutes,
      price,
      currency: data.currency || "USD",
      capacity,
      isActive: true,
      isBooked: false,
      recurring: data.recurring || "none",
      recurringUntil: data.recurringUntil ? this.normalizeDate(data.recurringUntil) : undefined,
      metadata: data.metadata,
    });

    log("Slot created:", slot._id);
    return slot;
  }

  /**
   * Get slots (optional teacher filter)
   */
  async getSlots(filter: { teacherId?: string }) {
    const query: any = {};
    if (filter.teacherId) query.teacherId = new Types.ObjectId(filter.teacherId);
    return SlotModel.find(query).sort({ startTime: 1 });
  }

  /**
   * Update a slot
   */
  async updateSlot(slotId: string, teacherId: string, updates: UpdateSlotDto) {
    log("Updating slot:", slotId);

    const slot = await SlotModel.findById(slotId);
    if (!slot) throw new Error("Slot not found");

    if (slot.teacherId.toString() !== teacherId) {
      throw new Error("Unauthorized: You can only update your own slots.");
    }

    const baseDate = updates.date ?? slot.date ?? new Date();

    if (updates.startTime) updates.startTime = this.normalizeTime(baseDate, updates.startTime);
    if (updates.endTime) updates.endTime = this.normalizeTime(baseDate, updates.endTime);

    if (updates.startTime && updates.endTime && updates.startTime >= updates.endTime) {
      throw new Error("Invalid time range: startTime must be before endTime.");
    }

    if (!updates.durationMinutes && updates.startTime && updates.endTime) {
      updates.durationMinutes = Math.floor((updates.endTime.getTime() - updates.startTime.getTime()) / 60000);
    }

    if (updates.price) updates.price = Number(updates.price);
    if (updates.capacity) updates.capacity = Number(updates.capacity);

    // Overlap check
    if (updates.startTime || updates.endTime) {
      const newStart = updates.startTime || slot.startTime;
      const newEnd = updates.endTime || slot.endTime;
      const overlap = await SlotModel.findOne({
        _id: { $ne: slotId },
        teacherId: new Types.ObjectId(teacherId),
        $or: [{ startTime: { $lt: newEnd }, endTime: { $gt: newStart } }],
      });
      if (overlap) throw new Error("Updated slot overlaps with an existing slot.");
    }

    Object.assign(slot, updates);
    await slot.save();

    log("Slot updated:", slot._id);
    return slot;
  }

  /**
   * Delete a slot
   */
  async deleteSlot(slotId: string, teacherId: string) {
    log("Deleting slot:", slotId);

    const slot = await SlotModel.findById(slotId);
    if (!slot) throw new Error("Slot not found");

    if (slot.teacherId.toString() !== teacherId) {
      throw new Error("Unauthorized: You can only delete your own slots.");
    }

    await SlotModel.findByIdAndDelete(slotId);
    log("Slot deleted:", slotId);

    return { message: "Slot deleted successfully", slotId };
  }
}
