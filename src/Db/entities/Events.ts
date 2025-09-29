import { Schema, model, Document, Types } from "mongoose";

export interface IEvent {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    createdBy: Types.ObjectId;  // <-- use ObjectId
    isActive: boolean;
    attendees?: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IEventDocument extends IEvent, Document {}

const EventSchema = new Schema<IEventDocument>({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const EventModel = model<IEventDocument>("Event", EventSchema);
