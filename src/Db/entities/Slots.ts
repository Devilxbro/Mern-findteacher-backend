import { Schema, model, Document, Types } from "mongoose";

export type SlotRecurring = "none" | "daily" | "weekly" |"monthly";

export interface ISlot {
    teacherId: Types.ObjectId;      // reference to User (teacher)
    date?: Date | null;             // specific date (start date)
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    price?: number;
    currency?: string;
    capacity?: number;
    isActive: boolean;
    isBooked?: boolean;
    recurring?: SlotRecurring;
    recurringUntil?: Date | null;
    metadata?: Record<string, any>;
}

export interface ISlotDocument extends ISlot, Document {
    _id: Types.ObjectId;
}

const SlotSchema = new Schema<ISlotDocument>(
    {
        teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        date: { type: Date },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        durationMinutes: { type: Number, required: true, min: 1 },
        price: { type: Number, default: 0 },
        currency: { type: String, default: "USD" },
        capacity: { type: Number, default: 1 },
        isActive: { type: Boolean, default: true },
        isBooked: { type: Boolean, default: false },
        recurring: { type: String, enum: ["none", "daily", "weekly"], default: "none" },
        recurringUntil: { type: Date },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);


SlotSchema.index({ teacherId: 1, startTime: 1, endTime: 1 });

export const SlotModel = model<ISlotDocument>("Slot", SlotSchema);
