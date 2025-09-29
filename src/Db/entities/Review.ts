import { Schema, model, Document, Types } from "mongoose";

export interface IReview {
  teacherId: Types.ObjectId;
  studentId: Types.ObjectId;
  rating: number;      // 1 to 5
  feedback?: string;
  createdAt?: Date;
}

export interface IReviewDocument extends IReview, Document {}

const reviewSchema = new Schema<IReviewDocument>({
  teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String },
}, { timestamps: true });

export const ReviewModel = model<IReviewDocument>("Review", reviewSchema);
