import { Request, Response } from 'express';
import { AuthService } from './services';
import { AuthRequest } from '../../Middleware/Middleware.ts';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      let {
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
        qualifications,
        experience,
        latitude,
        longitude,
        zipCode
      } = req.body;

      // Parse qualifications JSON if sent as string
      if (typeof qualifications === "string") {
        qualifications = JSON.parse(qualifications);
      }

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;

      qualifications = qualifications || [{}];

      if (files) {
        qualifications[0].degree = (files["degree"] || []).map(f => `img/${f.filename}`);
        qualifications[0].diplomas = (files["diplomas"] || []).map(f => `img/${f.filename}`);
        qualifications[0].certificate = (files["certificate"] || []).map(f => `img/${f.filename}`);
        qualifications[0].majorSubjects = (files["majorSubjects"] || []).map(f => `img/${f.filename}`);

        // Handle documentId
        if (files["documentId"] && files["documentId"].length > 0) {
          documentId = `img/${files["documentId"][0].filename}`;
        }

        // Handle proofsQualification - Convert array to JSON string
        if (files["proofsQualification"] && files["proofsQualification"].length > 0) {
          const proofsArray = files["proofsQualification"].map(f => `img/${f.filename}`);
          proofsQualification = JSON.stringify(proofsArray);
        }
      }

      // If proofsQualification exists but is not a string, convert it
      if (proofsQualification && typeof proofsQualification !== 'string') {
        proofsQualification = JSON.stringify(proofsQualification);
      }

      let location: { type: "Point"; coordinates: [number, number] } | undefined;
      if (latitude && longitude) {
        location = {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        };
      }

      // Call AuthService to create user
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
        qualifications,
        experience,
        location,
        zipCode
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
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

      // Generate OTP and send email
      const otp = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'OTP has been sent to your email',
        otp, // optional: for testing, remove in production
      });
    } catch (error: any) {
      res.status(200).json({ error: error.message });
    }
  }

  // ---------------- OTP-Based Reset Password ----------------
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      const result = await AuthService.resetPassword({ email, otp, newPassword, confirmPassword });

      res.status(200).json({
        success: true,
        message: result.message,
      });
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
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized' });
      }

      const user = await AuthService.getSpecificUser(userId);

      // Parse proofsQualification back to array for response
      if (user && user.proofsQualification && typeof user.proofsQualification === 'string') {
        try {
          (user as any).proofsQualification = JSON.parse(user.proofsQualification);
        } catch (e) {
          console.error('Error parsing proofsQualification:', e);
        }
      }

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
      return res.status(200).json({ success: true, result });
    } catch (error) {
      console.error('[Google Auth Error]', error);
      return res.status(401).json({ error: 'Google authentication failed' });
    }
  }

  static async editProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ error: 'Unauthorized: missing user ID in token.' });
    }

    let updates = { ...req.body };

    // Handle proofsQualification if it's being updated
    if (updates.proofsQualification && typeof updates.proofsQualification !== 'string') {
      updates.proofsQualification = JSON.stringify(updates.proofsQualification);
    }

    try {
      const updatedUser = await AuthService.updateUserProfile(userId, updates);

      // Parse proofsQualification back to array for response
      if (updatedUser && updatedUser.proofsQualification && typeof updatedUser.proofsQualification === 'string') {
        try {
          (updatedUser as any).proofsQualification = JSON.parse(updatedUser.proofsQualification);
        } catch (e) {
          console.error('Error parsing proofsQualification:', e);
        }
      }

      return res.status(200).json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error('[Edit Profile Error]', error);
      return res.status(400).json({ error: error.message || 'Update failed.' });
    }
  }

  static async deleteProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId; // get userId from AuthRequest (JWT)
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID in token.",
        });
      }

      const result = await AuthService.deleteUser(userId);

      return res.status(200).json({
        success: true,
        message: "User profile deleted successfully",
        data: result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Delete failed.";
      return res.status(400).json({
        success: false,
        message,
      });
    }
  }
}