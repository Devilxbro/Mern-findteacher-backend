import { Request, Response } from 'express';
import { AuthService } from './services';
import { AuthRequest } from '../../Middleware/Middleware.ts';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
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
      } = req.body;

      const result = await AuthService.signup({
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
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: result,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = await AuthService.login({ email, password });
      res
        .status(200)
        .json({ success: true, message: 'Login successful', token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const token = await AuthService.forgotPassword(email);
      res
        .status(200)
        .json({ success: true, message: 'Reset token generated', token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const result = await AuthService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      res.status(200).json({ message: result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }


  static async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await AuthService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // User-specific detail
  static async getSpecificUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await AuthService.getSpecificUser(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

    static async googleAuth(req: Request, res: Response) {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Missing Google credential token' });
        }

        try {
            const result = await AuthService.loginOrSignupWithGoogle(credential);
            return res.status(200).json(result);
        } catch (error) {
            console.error('[Google Auth Error]', error);
            return res.status(401).json({ error: 'Google authentication failed' });
        }
    }
}
