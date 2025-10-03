import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus =
    | "pending"
    | "booked"
    | "accepted"
    | "rejected"
    | "completed"
    | "cancelled"
    | "no-show";

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
    paymentId?: Types.ObjectId | null;
    cancelReason?: string;
    cancelledAt?: Date;
    cancelledBy?: Types.ObjectId | string; // admin, teacher, or student
    meta?: {
        meetingLink?: string;
        notes?: string;
        [key: string]: any;
    };
}

export interface IBookingDocument extends IBooking, Document {
    _id: Types.ObjectId;
}

const BookingSchema = new Schema<IBookingDocument>(
    {
        slotId: {
            type: Schema.Types.ObjectId,
            ref: "Slot",
            required: true,
            index: true,
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        startTime: {
            type: Date,
            required: true,
            index: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        durationMinutes: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "booked",
                "accepted",
                "rejected",
                "completed",
                "cancelled",
                "no-show",
            ],
            default: "pending",
            index: true,
        },
        pricePaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        currency: {
            type: String,
            default: "USD",
            trim: true,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
            default: null,
        },
        cancelReason: {
            type: String,
            trim: true,
        },
        cancelledAt: {
            type: Date,
        },
        cancelledBy: {
            type: Schema.Types.Mixed, // can be ObjectId or string
        },
        meta: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

//
// 📌 Indexes for performance
//
BookingSchema.index(
    { slotId: 1, studentId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $ne: "cancelled" } },
    }
);

BookingSchema.index({ teacherId: 1, startTime: 1 });
BookingSchema.index({ studentId: 1, startTime: 1 });
BookingSchema.index({ status: 1, startTime: 1 }); // fast upcoming/history queries


BookingSchema.virtual("isUpcoming").get(function (this: IBookingDocument) {
    return this.startTime > new Date() && this.status === "booked";
});

BookingSchema.pre("save", function (next) {
    if (this.startTime && this.endTime && !this.durationMinutes) {
        const minutes =
            (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
        this.durationMinutes = Math.max(Math.round(minutes), 1);
    }
    next();
});

export const BookingModel = model<IBookingDocument>("Booking", BookingSchema);
