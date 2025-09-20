import { Request, Response } from "express";
import { AuthService } from "./services";

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

      res.status(201).json({success: true, message: "User created successfully", user: result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }


  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = await AuthService.login({ email, password });
      res.status(200).json({success: true, message: "Login successful", token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }


  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const token = await AuthService.forgotPassword(email);
      res.status(200).json({success: true, message: "Reset token generated", token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
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
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // static  async verification(_req: Request, res: Response) {
  //
  // }
}
