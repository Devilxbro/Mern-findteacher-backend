
import envConfig from '../../Config/env.ts';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel , IUser} from '../../Db/entities/User';
import { SignupInput, LoginInput, ResetPasswordInput } from './Types';
import { hashPassword, comparePassword } from '../../Middleware/encrypt';
import { OAuth2Client } from 'google-auth-library';

const config = envConfig();
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

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
            throw new Error('User not found with this email.');
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expiry;
        await user.save();

        return token;
    }

    static async resetPassword(input: ResetPasswordInput) {
        const { token, newPassword, confirmPassword } = input;

        if (newPassword !== confirmPassword) {
            throw new Error('Passwords do not match.');
        }

        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new Error('Invalid or expired token.');
        }

        user.password = await hashPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return 'Password has been reset successfully.';
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
        console.log("----------->",config.GOOGLE_CLIENT_ID);

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
                googleId,
                firstName: name?.split(' ')[0] || 'N/A',
                lastName: name?.split(' ').slice(1).join(' ') || 'N/A',

                // changed: save strings instead of arrays/objects
                homeAddress: 'N/A',
                proofsAddress: '[]',              // store empty array as JSON string
                academicQualification: 'N/A',
                proofsQualification: '[]',        // store empty array as JSON string
                highestQualificationPerSubject: '{}', // store empty object as JSON string
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
                if (updates[field as keyof IUser]) {
                    delete updates[field as keyof IUser];
                }
            });


            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: updates },
                { new: true, runValidators: true }
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
