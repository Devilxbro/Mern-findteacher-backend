import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserModel } from "../../Db/entities/User.ts"; // adjust path
import {
  SignupInput,
  LoginInput,
  ResetPasswordInput,
} from "./Types";
import { hashPassword } from "../../Middleware/encrypt.ts"; // adjust the import path
export class AuthService {

  static async signup(input: SignupInput) {
      const { firstName, lastName, email, password, confirmPassword, role } = input;

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error("Email is already registered.");
    }
    const hashedPassword = await hashPassword(password);

    // Assume password is already hashed
    const newUser = new UserModel({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
        role: role,
      password : hashedPassword,
    });

    await newUser.save();
    return newUser;
  }


  static async login(input: LoginInput) {
    const { email, password } = input;

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Assume password is checked elsewhere
    // Remove bcrypt comparison
    if (password !== user.password) {
      throw new Error("Invalid email or password.");
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return token;
  }

  // Forgot Password (generate token)
  static async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("User not found with this email.");
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    await user.save();

    return token;
  }

  // Reset Password
  static async resetPassword(input: ResetPasswordInput) {
    const { token, newPassword, confirmPassword } = input;

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired token.");
    }

    // Assume newPassword is already hashed
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return "Password has been reset successfully.";
  }
}
