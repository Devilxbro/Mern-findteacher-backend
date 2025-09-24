import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus = "booked" | "cancelled" | "completed" | "no-show";

export interface IBooking {
    slotId: Types.ObjectId;
    teacherId: Types.ObjectId;
    studentId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    status: BookingStatus;
    pricePaid?: number;
    currency?: string;
    paymentId?: Types.ObjectId | null; // ref Payment
    cancelReason?: string;
    cancelledAt?: Date;
    meta?: Record<string, any>;    // notes, meeting link
}

export interface IBookingDocument extends IBooking, Document {
    _id: Types.ObjectId;
}

const BookingSchema = new Schema<IBookingDocument>(
    {
        slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
        teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        durationMinutes: { type: Number, required: true },
        status: { type: String, enum: ["booked", "cancelled", "completed", "no-show"], default: "booked" },
        pricePaid: { type: Number, default: 0 },
        currency: { type: String, default: "USD" },
        paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
        cancelReason: { type: String },
        cancelledAt: { type: Date },
        meta: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);


BookingSchema.index({ slotId: 1, studentId: 1 }, { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } });


BookingSchema.index({ teacherId: 1, startTime: 1 });
BookingSchema.index({ studentId: 1, startTime: 1 });

export const BookingModel = model<IBookingDocument>("Booking", BookingSchema);
