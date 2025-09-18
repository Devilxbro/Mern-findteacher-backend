export type UserRole = "student" | "teacher" | "admin";

export interface IUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
