import { Schema, model, Document } from "mongoose";

export interface IQualification {
  degree: string[];
  diplomas: string[];
  certificate: string[];
  majorSubjects?: string[] | null;
}

export interface IUser {
  title: string;
  firstName?: string | null;
  lastName: string;
  fullName: string;
  email?: string | null;
  password: string;
  role: "student" | "teacher" | "admin" | "user";
  userProfilePicture?: string;
  description?: string;
  isActive: boolean;
  isVerified: boolean;
  documentId?: string | null;
  homeAddress: string;
  proofsAddress: string;
  subjectsOffered: string[];
  qualifications: IQualification[];
  proofsQualification: string;
  highestQualificationPerSubject: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  academicQualification?: string;
  experience?: string;
  createdAt?: Date;
  updatedAt?: Date;

}

export interface IUserDocument extends IUser, Document {
  _id: string;
}

const QualificationSchema = new Schema<IQualification>(
  {
    degree: [{ type: String, required: false, trim: true }],
    diplomas: [{ type: String, required: false, trim: true }],
    certificate: [{ type: String, required: false, trim: true }],
    majorSubjects: [{ type: String, required: false }],
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument>(
  {
    title: { type: String, trim: true, required: false },
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    fullName: { type: String, required: false, trim: true },
    email: { type: String, required: false, unique: true, lowercase: true, trim: true },
    description: { type: String, required: false },
    userProfilePicture: { type: String, required: false },
    password: { type: String, required: false },
    role: { type: String, enum: ["student", "teacher", "admin", "user"], required: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    documentId: { type: String },
    homeAddress: { type: String, required: false },
    proofsAddress: { type: String, required: false },
    subjectsOffered: [{ type: String, required: false }],
    qualifications: [QualificationSchema], // Updated array of objects
    proofsQualification: { type: String, required: false },
    academicQualification: { type: String, required: false },
    highestQualificationPerSubject: { type: String, required: false },
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },
    experience: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

export const UserModel = model<IUserDocument>("User", userSchema);
