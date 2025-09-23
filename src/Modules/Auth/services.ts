import envConfig from '../../Config/env.ts';
import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
import { UserModel, IUser , IQualification} from '../../Db/entities/User';
import { SignupInput, LoginInput } from './Types';
import { hashPassword, comparePassword } from '../../Middleware/encrypt';
import { OAuth2Client } from 'google-auth-library';
import Mailer from "../../Constants/Nodemailer.ts";
import { PasswordResetTemplate,PasswordResetSuccessTemplate } from "../../Utls/verifiactionmail.ts";
const config = envConfig();
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export class AuthService {
  static async signup(input: SignupInput & { qualifications?: IQualification[] }) {
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
      qualifications,
      proofsQualification,
      highestQualificationPerSubject,
      userProfilePicture,
      description,
    } = input;

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error('Email is already registered.');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new UserModel({
      title,
      firstName,
      lastName,
      fullName: `${title} ${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role,
      documentId,
      homeAddress,
      proofsAddress,
      subjectsOffered,
      qualifications: qualifications || [],
      proofsQualification,
      highestQualificationPerSubject,
      userProfilePicture,
      description,
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
      throw new Error('Invalid email or password.');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '5d' },
    );

    return token;
  }
  static async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("User not found with this email.");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = expiry;
    await user.save();

    // Send OTP email
    await Mailer.sendMail({
      to: user.email ?? "",
      subject: "Password Reset OTP",
      html: PasswordResetTemplate(user.firstName ?? "User", otp),
    });
    console.log("otp", otp)

    return otp; // optional: return for testing purposes

  }

  static async resetPassword(input: { email: string; otp: string; newPassword: string; confirmPassword: string }) {
    const { email, otp, newPassword, confirmPassword } = input;

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const user = await UserModel.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: new Date() }, // OTP still valid
    });

    if (!user) {
      throw new Error("Invalid or expired OTP.");
    }

    // Hash new password
    user.password = await hashPassword(newPassword);

    // Clear OTP fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Send success email
    await Mailer.sendMail({
      to: user.email ?? "",
      subject: "Password Successfully Reset",
      html: PasswordResetSuccessTemplate(user.firstName ?? "User"),
    });

    return { success: true, message: "Password has been reset successfully." };
  }


  static async getAllUsers() {
    try {
      const users = await UserModel.find().select(
        '-password -resetPasswordToken -resetPasswordExpires',
      );
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users.');
    }
  }

  static async getSpecificUser(userId: string) {
    try {
      const user = await UserModel.findById(userId).select(
        '-password -resetPasswordToken -resetPasswordExpires',
      );
      if (!user) {
        throw new Error('User not found.');
      }
      return user;
    } catch (error) {
      console.error('Error fetching specific user:', error);
      throw new Error('Failed to fetch user.');
    }
  }

  static async loginOrSignupWithGoogle(credential: string) {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });
    console.log('----------->', config.GOOGLE_CLIENT_ID);

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');

    const { email, name, sub: googleId } = payload;
    if (!email) throw new Error('Google account has no email');

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = new UserModel({
        email,
        fullName: name || '',
        password: '',
        isVerified: true,
        isActive: true,
        role: 'user',
        title: 'N/A',
        userProfilePicture: '',
        description: '',
        googleId,
        firstName: name?.split(' ')[0] || 'N/A',
        lastName: name?.split(' ').slice(1).join(' ') || 'N/A',

        // changed: save strings instead of arrays/objects
        homeAddress: 'N/A',
        proofsAddress: '[]', // store empty array as JSON string
        academicQualification: 'N/A',
        proofsQualification: '[]', // store empty array as JSON string
        highestQualificationPerSubject: '{}',
        qualifications: [],// store empty object as JSON string
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '5d' },
    );

    return { token, user };
  }

    static async updateUserProfile(userId: string, updates: Partial<IUser>) {
        try {
            const disallowedFields = ['password'];
            disallowedFields.forEach((field) => {
                if (updates[field as keyof IUser] !== undefined) {
                    delete updates[field as keyof IUser];
                }
            });

            // Sanitize updates: skip null or empty string values
            const sanitizedUpdates: Partial<IUser> = {};
            Object.keys(updates).forEach((key) => {
                const k = key as keyof IUser;
                const value = updates[k];

                // Skip null or empty string values
                if (value !== null && value !== '' && value !== undefined) {
                    sanitizedUpdates[k] = value as any;
                }
            });

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: sanitizedUpdates },
                { new: true, runValidators: true, omitUndefined: true } // omitUndefined ensures keys not in sanitizedUpdates are ignored
            ).select('-password -resetPasswordToken -resetPasswordExpires');

            if (!updatedUser) {
                throw new Error('User not found.');
            }

            return updatedUser;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Failed to update user profile.');
        }
    }

}
