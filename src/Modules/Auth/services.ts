import envConfig from "../../Config/env.ts";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserModel } from "../../Db/entities/User";
import {
    SignupInput,
    LoginInput,
    ResetPasswordInput,
} from "./Types";
import { hashPassword } from "../../Middleware/encrypt";
import { comparePassword } from "../../Middleware/encrypt";
const config = envConfig();
export class AuthService {

    static async signup(input: SignupInput) {
        const {
            title,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            role,
            documentId,
            homeAddress,
            proofsAddress,
            subjectsOffered,
            academicQualification,
            proofsQualification,
            highestQualificationPerSubject,
        } = input;

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            throw new Error("Email is already registered.");
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new UserModel({
            title,
            firstName,
            lastName,
            fullName: `${title} ${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: role ,
            documentId,
            homeAddress,
            proofsAddress,
            subjectsOffered,
            academicQualification,
            proofsQualification,
            highestQualificationPerSubject,
            isActive: true,
            isVerified: false,
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


        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password.");
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: "5d" }
        );

        return token;
    }

    static async forgotPassword(email: string) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error("User not found with this email.");
        }

        const token = crypto.randomBytes(20).toString("hex");
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expiry;
        await user.save();

        return token;
    }


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

        user.password = await hashPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return "Password has been reset successfully.";
    }
}
