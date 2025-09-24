import { SlotModel, ISlotDocument } from "../../Db/entities/Slots.ts";
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

  async createSlot(data: CreateSlotDto): Promise<ISlotDocument> {
    log("Creating slot with data:", data);

    const teacher = await UserModel.findById(data.teacherId);
    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Invalid teacherId. Must belong to a teacher.");
    }

    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw new Error("Invalid time range: startTime must be before endTime.");
    }

    const overlap = await SlotModel.findOne({
      teacherId: new Types.ObjectId(data.teacherId),
      $or: [
        {
          startTime: { $lt: data.endTime },
          endTime: { $gt: data.startTime },
        },
      ],
    });

    if (overlap) throw new Error("Slot overlaps with an existing slot.");

    const slot = await SlotModel.create(data);
    log("Slot created:", slot._id);
    return slot;
  }

  async getSlots(filter: { teacherId?: string }) {
    const query: any = {};
    if (filter.teacherId) query.teacherId = new Types.ObjectId(filter.teacherId);
    return SlotModel.find(query).sort({ startTime: 1 });
  }

  async updateSlot(slotId: string, teacherId: string, updates: UpdateSlotDto) {
    log("Updating slot:", slotId);

    const slot = await SlotModel.findById(slotId);
    if (!slot) throw new Error("Slot not found");

    //  Ownership check
    if (slot.teacherId.toString() !== teacherId) {
      throw new Error("Unauthorized: You can only update your own slots.");
    }

    if (
      updates.startTime &&
      updates.endTime &&
      new Date(updates.startTime) >= new Date(updates.endTime)
    ) {
      throw new Error("Invalid time range: startTime must be before endTime.");
    }

    Object.assign(slot, updates);
    await slot.save();
    log("Slot updated:", slot._id);

    return slot;
  }

  async deleteSlot(slotId: string, teacherId: string) {
    log("Deleting slot:", slotId);

    const slot = await SlotModel.findById(slotId);
    if (!slot) throw new Error("Slot not found");

    //  Ownership check
    if (slot.teacherId.toString() !== teacherId) {
      throw new Error("Unauthorized: You can only delete your own slots.");
    }

    await SlotModel.findByIdAndDelete(slotId);
    log("Slot deleted:", slotId);

    return { message: "Slot deleted successfully", slotId };
  }
}
