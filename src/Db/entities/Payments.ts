import { Schema, model, Document, Types } from "mongoose";

export interface IPayment {
    bookingId?: Types.ObjectId;
    amount: number;
    currency?: string;
    method?: string; // e.g., stripe, paypal
    providerRef?: string;
    status?: "pending" | "succeeded" | "failed" | "refunded";
    metadata?: Record<string, any>;
}

export interface IPaymentDocument extends IPayment, Document {
    _id: Types.ObjectId;
}

const PaymentSchema = new Schema<IPaymentDocument>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
        amount: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        method: { type: String },
        providerRef: { type: String },
        status: { type: String, enum: ["pending", "succeeded", "failed", "refunded"], default: "pending" },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const PaymentModel = model<IPaymentDocument>("Payment", PaymentSchema);
