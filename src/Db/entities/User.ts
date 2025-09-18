import { Schema, model, Document } from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}



export interface IUserDocument extends IUser, Document {
  _id: string;
}

const userSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },
  },
  { timestamps: true }
);
export const UserModel = model<IUserDocument>("User", userSchema);
