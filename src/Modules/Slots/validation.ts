// src/Modules/Slots/validation.ts
import { z } from "zod";
import { Types } from "mongoose";

export const createSlotSchema = z.object({
  teacherId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid teacherId",
  }),
  date: z.string().datetime().nullable().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationMinutes: z.number().min(1),
  price: z.number().min(0).optional(),
  currency: z.string().default("USD").optional(),
  capacity: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  recurring: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  recurringUntil: z.string().datetime().nullable().optional(),
  // metadata: z.record(z.any()).optional(),
});

export const updateSlotSchema = createSlotSchema.partial();

export type CreateSlotDto = z.infer<typeof createSlotSchema>;
export type UpdateSlotDto = z.infer<typeof updateSlotSchema>;
