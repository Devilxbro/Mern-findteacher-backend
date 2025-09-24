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
   * Normalize time relative to a base date
   * - time: "HH:mm" or "YYYY-MM-DD"
   * - date: base date "YYYY-MM-DD"
   */
  private normalizeTime(date: string | Date, time: string | Date): Date {
    const baseDate = this.normalizeDate(date);
    if (time instanceof Date) return time;

    // If time is HH:mm, merge with base date
    if (/^\d{2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(":").map(Number);
      baseDate.setUTCHours(hours, minutes, 0, 0);
      return baseDate;
    }

    // Otherwise treat as full date string
    return new Date(time);
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

    // 2️⃣ Normalize dates
    const baseDate = data.date instanceof Date ? data.date : data.date;
    const startTime = this.normalizeTime(baseDate, data.startTime);
    const endTime = this.normalizeTime(baseDate, data.endTime);

    if (startTime >= endTime) {
      throw new Error("Invalid time range: startTime must be before endTime.");
    }

    // 3️⃣ Numeric coercion
    const durationMinutes = Number(data.durationMinutes);
    const price = data.price !== undefined ? Number(data.price) : 0;
    const capacity = data.capacity !== undefined ? Number(data.capacity) : 1;

    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      throw new Error("durationMinutes must be a positive number.");
    }

    // 4️⃣ Overlap check
    const overlap = await SlotModel.findOne({
      teacherId: new Types.ObjectId(data.teacherId),
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });
    if (overlap) throw new Error("Slot overlaps with an existing slot.");

    // 5️⃣ Create slot
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
