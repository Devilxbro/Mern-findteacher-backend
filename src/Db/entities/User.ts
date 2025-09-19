import { Schema, model, Document } from "mongoose";

export interface IUser {
  title: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  isActive: boolean;
  isVerified: boolean;
  documentId?: string;
  homeAddress: string;
  proofsAddress: string;
  subjectsOffered: string; // in future we can make it ref obj id
  academicQualification: string;
  proofsQualification: string;
  highestQualificationPerSubject: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
}

const userSchema = new Schema<IUserDocument>(
  {
    title: { type: String, trim: true, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], required: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    documentId: { type: String },
    homeAddress: { type: String, required: true },
    proofsAddress: { type: String, required: true },
    subjectsOffered: { type: String, required: true },
    academicQualification: { type: String, required: true },
    proofsQualification: { type: String, required: true },
    highestQualificationPerSubject: { type: String, required: true },
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },
  },
  { timestamps: true }
);

export const UserModel = model<IUserDocument>("User", userSchema);
