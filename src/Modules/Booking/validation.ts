import { z } from "zod";

export const AvailableSlotsQuerySchema = z.object({
  date: z.string().optional(),
  teacherId: z.string().optional(),
});

export const BookSlotDto = z.object({
  slotId: z.string(),
});

export const CancelBookingParamsSchema = z.object({
  id: z.string(),
});

export type BookSlotDtoType = z.infer<typeof BookSlotDto>;
