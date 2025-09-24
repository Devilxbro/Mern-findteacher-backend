// src/Modules/Slots/types.ts
import { Types } from "mongoose";

export interface CreateSlotDto {
  teacherId: Types.ObjectId | string;
  date?: Date | null;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  price?: number;
  currency?: string;
  capacity?: number;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  recurringUntil?: Date | null;
  metadata?: Record<string, any>;
}

export interface UpdateSlotDto {
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  price?: number;
  currency?: string;
  capacity?: number;
  isActive?: boolean;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  recurringUntil?: Date | null;
  metadata?: Record<string, any>;
}
